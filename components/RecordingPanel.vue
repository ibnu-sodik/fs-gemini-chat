<template>
  <div
    v-show="modelValue"
    class="rounded-full border p-4 bg-white flex flex-row items-center justify-between gap-2"
    :style="{ minHeight: waveHeight + 32 + 'px' }"
  >
    <div class="flex justify-start gap-2 items-center">
      <button
        type="button"
        class="flex items-center justify-center w-7 h-7 rounded-full hover:bg-gray-200 cursor-not-allowed"
        title="Add Files and more /"
        disabled
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 stroke-2 text-gray-900"
          viewBox="0 -960 960 960"
          fill="#000"
        >
          <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
        </svg>
      </button>
    </div>

    <div class="flex-1 flex flex-col justify-center px-2 items-stretch">
      <div
        v-show="isRecording"
        ref="wavesurferRef"
        class="w-full rounded-lg overflow-hidden"
        :style="{ height: waveHeight + 'px' }"
      ></div>
      <div v-if="!isRecording" class="text-xs text-gray-500 mt-2 text-center">
        <span v-if="recordedAudio">Mohon tunggu</span>
        <span v-else>Siap merekam</span>
      </div>
    </div>
    <div class="flex justify-end gap-2 items-center">
      <button
        type="button"
        class="flex items-center justify-center w-7 h-7 rounded-full hover:bg-gray-200 cursor-pointer"
        title="Cancel"
        @click="onCancel"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 -960 960 960"
          class="h-5 w-5"
          fill="#000"
        >
          <path
            d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"
          />
        </svg>
      </button>
      <button
        type="button"
        class="flex items-center justify-center w-7 h-7 rounded-full hover:bg-gray-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        :title="isRecording ? 'Stop & Transcribe' : 'Transcribe'"
        @click="onConfirm"
        :disabled="isTranscribing"
      >
        <svg
          v-if="!isTranscribing"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 -960 960 960"
          class="h-5 w-5"
          fill="#000"
        >
          <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
        </svg>
        <svg
          v-else
          class="animate-spin h-5 w-5 text-gray-700"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
            fill="none"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js";
import { ref, watch, onUnmounted, computed } from "vue";

const props = defineProps<{
  modelValue: boolean; // controls visibility
  waveHeight?: number; // desired waveform height (px)
}>();
const waveHeight = computed(() => Math.max(32, props.waveHeight ?? 5));
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "transcribed", text: string): void;
  (e: "error", message: string): void;
}>();

const wavesurferRef = ref<HTMLDivElement | null>(null);
let wavesurfer: any = null;
let record: any = null;
const isRecording = ref(false);
const recordedAudio = ref<string>("");
const audioBlob = ref<Blob | null>(null);
const isTranscribing = ref(false);
const pendingConfirm = ref(false); // user clicked confirm while recording
let didCancelRecording = false;

watch(
  () => props.modelValue,
  async (val) => {
    if (val) {
      await startRecording();
    } else {
      cleanup();
    }
  }
);

async function startRecording() {
  didCancelRecording = false;
  cleanup();
  if (wavesurferRef.value) {
    wavesurfer = WaveSurfer.create({
      container: wavesurferRef.value,
      waveColor: "rgba(0, 0, 0, 0.5)",
      progressColor: "rgba(0, 0, 0, 0.5)",
      height: waveHeight.value,
      normalize: true,
    });
    record = wavesurfer.registerPlugin(
      RecordPlugin.create({
        renderRecordedAudio: false,
        scrollingWaveform: true,
        continuousWaveform: false,
      })
    );
    record.on("record-end", (blob: Blob) => {
      audioBlob.value = blob;
      const reader = new FileReader();
      reader.onload = async () => {
        recordedAudio.value = reader.result as string; // base64 retained
        stopVisualizer();
        if (pendingConfirm.value) {
          pendingConfirm.value = false;
          // langsung mulai transcribe
          await doTranscribe();
        }
      };
      reader.readAsDataURL(blob);
    });
    await record.startRecording();
    isRecording.value = true;
  }
}

function stopVisualizer() {
  if (wavesurfer) {
    wavesurfer.destroy();
    wavesurfer = null;
    record = null;
  }
  isRecording.value = false;
}

function stopRecording() {
  if (record && isRecording.value) {
    record.stopRecording();
  }
}

function onCancel() {
  didCancelRecording = true;
  if (isRecording.value) stopRecording();
  recordedAudio.value = "";
  audioBlob.value = null;
  emit("update:modelValue", false);
}

async function onConfirm() {
  if (isTranscribing.value) return;
  // Jika masih recording, hentikan dulu lalu proses di record-end
  if (isRecording.value) {
    pendingConfirm.value = true;
    stopRecording();
    return;
  }
  if (!recordedAudio.value) return; // belum ada hasil
  await doTranscribe();
}

async function doTranscribe() {
  if (!recordedAudio.value) return;
  isTranscribing.value = true;
  await transcribeAudio(recordedAudio.value);
  isTranscribing.value = false;
  emit("update:modelValue", false);
}

async function transcribeAudio(audioBase64: string) {
  try {
    const res = await fetch("/api/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioBase64 }),
    });
    const data = await res.json();
    if (data.text) {
      emit("transcribed", data.text);
    } else {
      emit("error", "Gagal transkripsi audio");
    }
  } catch (e: any) {
    emit("error", e.message || "Gagal transkripsi audio");
  }
}

function cleanup() {
  stopVisualizer();
  recordedAudio.value = "";
  audioBlob.value = null;
  isTranscribing.value = false;
}

onUnmounted(() => cleanup());
</script>
