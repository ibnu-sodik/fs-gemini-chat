<template>
  <div class="border rounded-lg px-2 py-2">
    <div
      v-show="uploadedFiles.length && showThumbnails"
      class="flex flex-row gap-2 items-center px-2 pb-2 shadow-md flex-wrap"
    >
      <template v-for="(file, idx) in uploadedFiles" :key="file.id">
        <template v-if="file.isImage">
          <div class="relative group">
            <img
              :src="file.previewUrl"
              alt="preview"
              class="w-16 h-16 object-cover rounded cursor-pointer border border-gray-300"
              @click="() => handlePreview(idx)"
            />
            <button
              @click="removeFile(idx)"
              class="absolute top-0.5 right-0.5 bg-white rounded-full border border-gray-300 w-4 h-4 flex items-center justify-center text-xs text-gray-700 opacity-80 cursor-pointer group-hover:opacity-100"
              title="Hapus file"
            >
              ✕
            </button>
          </div>
        </template>
        <template v-else-if="file.isPdf">
          <div
            class="relative flex items-center gap-2 cursor-pointer p-2 h-16 border border-gray-300 rounded"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 -960 960 960"
              fill="red"
              class="w-7 h-7"
            >
              <path
                d="M360-460h40v-80h40q17 0 28.5-11.5T480-580v-40q0-17-11.5-28.5T440-660h-80v200Zm40-120v-40h40v40h-40Zm120 120h80q17 0 28.5-11.5T640-500v-120q0-17-11.5-28.5T600-660h-80v200Zm40-40v-120h40v120h-40Zm120 40h40v-80h40v-40h-40v-40h40v-40h-80v200ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z"
              />
            </svg>
            <span class="text-sm font-medium" @click="handlePreview(idx)">{{
              file.name
            }}</span>
            <button
              @click="removeFile(idx)"
              class="absolute top-0.5 right-0.5 bg-white rounded-full border border-gray-300 w-5 h-5 flex items-center justify-center text-xs text-gray-700 opacity-80 cursor-pointer hover:opacity-100"
              title="Hapus file"
            >
              ✕
            </button>
          </div>
        </template>
        <template v-else-if="file.isAudio">
          <div
            class="relative flex items-center gap-2 cursor-pointer p-2 h-16 border border-gray-300 rounded bg-gray-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              class="w-7 h-7 text-blue-600"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19V6l12-2v13"
              />
            </svg>
            <span class="text-sm font-medium">{{ file.name }}</span>
            <template v-if="audioStates[idx]?.status === 'playing'">
              <button
                @click="() => pauseAudio(idx)"
                class="cursor-pointer"
                title="Pause"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 -960 960 960"
                  class="h-5 w-5"
                  fill="#000"
                >
                  <path
                    d="M360-320h80v-320h-80v320Zm160 0h80v-320h-80v320ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"
                  />
                </svg>
              </button>
              <button
                @click="() => stopAudio(idx)"
                class="cursor-pointer"
                title="Stop"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 -960 960 960"
                  fill="#000"
                >
                  <path
                    d="M320-320h320v-320H320v320ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"
                  />
                </svg>
              </button>
              <button
                @click="() => transcribeAudioFile(idx)"
                :disabled="audioStates[idx]?.transcribing"
                :class="[
                  'mr-3',
                  audioStates[idx]?.transcribing
                    ? 'cursor-not-allowed opacity-50'
                    : 'cursor-pointer',
                ]"
                title="Transcribe"
              >
                <svg
                  v-if="!audioStates[idx]?.transcribing"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 -960 960 960"
                  class="h-5 w-5"
                  fill="#000"
                >
                  <path
                    d="M680-560q-33 0-56.5-23T600-640v-160q0-34 23.5-57t56.5-23q34 0 57 23t23 57v160q0 34-23 57t-57 23ZM200-80q-33 0-56.5-23.5T120-160v-640q0-33 23.5-56.5T200-880h320v80H200v640h440v-80h80v80q0 33-23.5 56.5T640-80H200Zm80-160v-80h280v80H280Zm0-120v-80h200v80H280Zm440 40h-80v-104q-77-14-128.5-74.5T460-640h80q0 58 41 99t99 41q59 0 99.5-41t40.5-99h80q0 81-51 141.5T720-424v104Z"
                  />
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
            </template>
            <template v-else-if="audioStates[idx]?.status === 'paused'">
              <button
                @click="() => playAudio(idx)"
                class="cursor-pointer"
                title="Play"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 -960 960 960"
                  class="h-5 w-5"
                  fill="#000"
                >
                  <path
                    d="m380-300 280-180-280-180v360ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"
                  />
                </svg>
              </button>
              <button
                @click="() => stopAudio(idx)"
                class="cursor-pointer"
                title="Stop"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 -960 960 960"
                  fill="#000"
                >
                  <path
                    d="M320-320h320v-320H320v320ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"
                  />
                </svg>
              </button>
              <button
                @click="() => transcribeAudioFile(idx)"
                :disabled="audioStates[idx]?.transcribing"
                :class="[
                  'mr-3',
                  audioStates[idx]?.transcribing
                    ? 'cursor-not-allowed opacity-50'
                    : 'cursor-pointer',
                ]"
                title="Transcribe"
              >
                <svg
                  v-if="!audioStates[idx]?.transcribing"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 -960 960 960"
                  class="h-5 w-5"
                  fill="#000"
                >
                  <path
                    d="M680-560q-33 0-56.5-23T600-640v-160q0-34 23.5-57t56.5-23q34 0 57 23t23 57v160q0 34-23 57t-57 23ZM200-80q-33 0-56.5-23.5T120-160v-640q0-33 23.5-56.5T200-880h320v80H200v640h440v-80h80v80q0 33-23.5 56.5T640-80H200Zm80-160v-80h280v80H280Zm0-120v-80h200v80H280Zm440 40h-80v-104q-77-14-128.5-74.5T460-640h80q0 58 41 99t99 41q59 0 99.5-41t40.5-99h80q0 81-51 141.5T720-424v104Z"
                  />
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
            </template>
            <template v-else>
              <button
                @click="() => playAudio(idx)"
                class="cursor-pointer"
                title="Play"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 -960 960 960"
                  class="h-5 w-5"
                  fill="#000"
                >
                  <path
                    d="m380-300 280-180-280-180v360ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"
                  />
                </svg>
              </button>
              <button
                @click="() => transcribeAudioFile(idx)"
                :disabled="audioStates[idx]?.transcribing"
                :class="[
                  'mr-3',
                  audioStates[idx]?.transcribing
                    ? 'cursor-not-allowed opacity-50'
                    : 'cursor-pointer',
                ]"
                title="Transcribe"
              >
                <svg
                  v-if="!audioStates[idx]?.transcribing"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 -960 960 960"
                  class="h-5 w-5"
                  fill="#000"
                >
                  <path
                    d="M680-560q-33 0-56.5-23T600-640v-160q0-34 23.5-57t56.5-23q34 0 57 23t23 57v160q0 34-23 57t-57 23ZM200-80q-33 0-56.5-23.5T120-160v-640q0-33 23.5-56.5T200-880h320v80H200v640h440v-80h80v80q0 33-23.5 56.5T640-80H200Zm80-160v-80h280v80H280Zm0-120v-80h200v80H280Zm440 40h-80v-104q-77-14-128.5-74.5T460-640h80q0 58 41 99t99 41q59 0 99.5-41t40.5-99h80q0 81-51 141.5T720-424v104Z"
                  />
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
            </template>
            <button
              @click="removeFile(idx)"
              class="absolute top-0.5 right-0.5 bg-white rounded-full border border-gray-300 w-5 h-5 flex items-center justify-center text-xs text-gray-700 opacity-80 cursor-pointer hover:opacity-100"
              title="Hapus file"
            >
              ✕
            </button>
          </div>
        </template>
      </template>
    </div>

    <input
      type="file"
      accept="image/*,application/pdf,audio/*"
      multiple
      @change="handleFileChange"
      ref="fileInputRef"
      class="hidden"
    />
    <textarea
      v-model="input"
      @keydown.enter="handleEnter"
      @input="resizeTextarea"
      ref="inputRef"
      placeholder="Ketik pesan..."
      class="w-full border-none outline-none px-2 resize-none min-h-[40px] max-h-[192px] overflow-y-auto bg-transparent pt-2"
      :disabled="isLoading"
      rows="1"
      style="line-height: 1.5"
    />

    <div class="flex flex-row justify-between items-center">
      <div class="flex justify-start mt-2">
        <div class="relative">
          <button
            type="button"
            @click="toggleFilesMenu"
            :class="[
              'flex items-center justify-center w-7 h-7 rounded-full cursor-pointer hover:bg-gray-200',
              showFilesMenu ? 'bg-gray-200' : '',
            ]"
            title="Add Files and more /"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 stroke-2 text-gray-900"
              viewBox="0 -960 960 960"
              fill="#000"
            >
              <path
                d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"
              />
            </svg>
          </button>
          <transition name="fade">
            <div
              v-if="showFilesMenu"
              ref="filesMenuRef"
              class="absolute left-0 bottom-full mb-2 z-10 bg-white border rounded-lg shadow-lg p-2 w-60 flex flex-col gap-2"
            >
              <button
                type="button"
                @click="addPhotosFiles"
                class="flex flex-row w-full text-left px-3 py-2 rounded cursor-pointer hover:bg-gray-100 text-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-2"
                  viewBox="0 -960 960 960"
                >
                  <path
                    d="M720-330q0 104-73 177T470-80q-104 0-177-73t-73-177v-370q0-75 52.5-127.5T400-880q75 0 127.5 52.5T580-700v350q0 46-32 78t-78 32q-46 0-78-32t-32-78v-370h80v370q0 13 8.5 21.5T470-320q13 0 21.5-8.5T500-350v-350q-1-42-29.5-71T400-800q-42 0-71 29t-29 71v370q-1 71 49 120.5T470-160q70 0 119-49.5T640-330v-390h80v390Z"
                  />
                </svg>
                <span> Add photos & files </span>
              </button>
              <button
                type="button"
                @click="createImage"
                class="flex flex-row w-full text-left px-3 py-2 rounded cursor-pointer hover:bg-gray-100 text-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-2"
                  viewBox="0 -960 960 960"
                >
                  <path
                    d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm40-80h480L570-480 450-320l-90-120-120 160Zm-40 80v-560 560Z"
                  />
                </svg>
                <span> Create Image </span>
              </button>
            </div>
          </transition>
        </div>
        <div class="ml-2">
          <label for="model-switcher" class="text-xs text-gray-500 mr-2">
            Model:
          </label>
          <select
            id="model-switcher"
            v-model="selectedModelLocal"
            class="border rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option
              v-for="opt in modelOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>
      <div></div>
      <div class="flex justify-end mt-2">
        <button
          type="button"
          class="mr-2 hover:bg-gray-200 flex items-center justify-center w-7 h-7 rounded-full cursor-pointer"
          title="Rekam suara"
          @click="emit('start-recording')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 -960 960 960"
            fill="#000"
            class="h-5 w-5 stroke-2 text-gray-900"
          >
            <path
              d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm0-240Zm-40 520v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520h80q0 105-68 184t-172 93v123h-80Zm40-360q17 0 28.5-11.5T520-520v-240q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v240q0 17 11.5 28.5T480-480Z"
            />
          </svg>
        </button>

        <button
          type="button"
          @click="onSend"
          :disabled="isLoading"
          :class="[
            'flex items-center justify-center w-7 h-7 hover:bg-gray-200 rounded-full cursor-pointer',
          ]"
          title="Kirim"
        >
          <svg
            v-if="isLoading"
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
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 -960 960 960"
            fill="#000"
            class="h-5 w-5 stroke-2"
          >
            <path
              d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"
            />
          </svg>
          <!-- <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 stroke-2"
            viewBox="0 -960 960 960"
            fill="#fff"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M440-160v-487L216-423l-56-57 320-320 320 320-56 57-224-224v487h-80Z"
            />
          </svg> -->
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useChat } from "@/composables/useChat";
import { toast } from "vue3-toastify";

const props = defineProps<{
  modelOptions: { value: string; label: string }[];
  modelValue: string; // selected model
  showThumbnails: boolean;
}>();
const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "start-recording"): void;
  (e: "send"): void;
  (e: "preview-image", url: string): void;
  (e: "preview-pdf", url: string): void;
  (e: "update:showThumbnails", value: boolean): void;
}>();

const { uploadedFiles, input, isLoading } = useChat();

const selectedModelLocal = ref(props.modelValue);
watch(selectedModelLocal, (v) => emit("update:modelValue", v));
watch(
  () => props.modelValue,
  (v) => {
    if (v !== selectedModelLocal.value) selectedModelLocal.value = v;
  }
);

const showFilesMenu = ref(false);
const filesMenuRef = ref<HTMLElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const inputRef = ref<HTMLTextAreaElement | null>(null);

// audio states for uploaded audio preview
const audioStates = reactive<{
  [idx: number]: {
    status: "idle" | "playing" | "paused";
    audio?: HTMLAudioElement;
    transcribing?: boolean;
  };
}>({});

function handleFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files;
  if (!files || files.length === 0) return;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const isImage = file.type.startsWith("image");
    const isPdf = file.type === "application/pdf";
    const isAudio = file.type.startsWith("audio");
    if (!isImage && !isPdf && !isAudio) continue;
    uploadedFiles.value.push({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
      isImage,
      isPdf,
      isAudio,
      previewUrl: URL.createObjectURL(file),
    });
  }
  emit("update:showThumbnails", true);
  if (fileInputRef.value) fileInputRef.value.value = "";
}

function optionFiles() {
  fileInputRef.value?.click();
}

function removeFile(idx: number) {
  uploadedFiles.value.splice(idx, 1);
}

function toggleFilesMenu() {
  showFilesMenu.value = !showFilesMenu.value;
}

function addPhotosFiles() {
  showFilesMenu.value = false;
  optionFiles();
}

function createImage() {
  showFilesMenu.value = false;
  alert("Create Image clicked!");
}

function handlePreview(idx: number) {
  const fileObj = uploadedFiles.value[idx];
  if (fileObj.isImage) emit("preview-image", fileObj.previewUrl);
  else if (fileObj.isPdf) emit("preview-pdf", fileObj.previewUrl);
}

function handleEnter(e: KeyboardEvent) {
  if (e.ctrlKey && e.key === "Enter") {
    e.preventDefault();
    onSend();
  }
}

function resizeTextarea() {
  const el = inputRef.value;
  if (!el) return;
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 192) + "px";
  el.style.overflowY = el.scrollHeight > 192 ? "auto" : "hidden";
}

function onSend() {
  emit("update:showThumbnails", false);
  emit("send");
}

// audio controls
function playAudio(idx: number) {
  const fileObj = uploadedFiles.value[idx];
  if (!fileObj || !fileObj.isAudio) return;
  Object.keys(audioStates).forEach((key) => {
    const i = Number(key);
    if (audioStates[i]?.audio && i !== idx) {
      audioStates[i].audio!.pause();
      audioStates[i].audio!.currentTime = 0;
      audioStates[i].status = "idle";
    }
  });
  if (audioStates[idx]?.audio) {
    audioStates[idx].audio!.play();
    audioStates[idx].status = "playing";
    return;
  }
  const audio = new Audio(fileObj.previewUrl);
  audioStates[idx] = { status: "playing", audio };
  audio.play();
  audio.onended = () => (audioStates[idx].status = "idle");
}
function pauseAudio(idx: number) {
  if (audioStates[idx]?.audio && audioStates[idx].status === "playing") {
    audioStates[idx].audio!.pause();
    audioStates[idx].status = "paused";
  }
}
function stopAudio(idx: number) {
  if (audioStates[idx]?.audio) {
    audioStates[idx].audio!.pause();
    audioStates[idx].audio!.currentTime = 0;
    audioStates[idx].status = "idle";
  }
}
function transcribeAudioFile(idx: number) {
  const fileObj = uploadedFiles.value[idx];
  if (!fileObj || !fileObj.isAudio) return;

  // Prevent multiple simultaneous transcriptions
  if (audioStates[idx]?.transcribing) return;

  // Initialize audioStates[idx] if not exists
  if (!audioStates[idx]) {
    audioStates[idx] = { status: "idle" };
  }

  // Set transcribing state
  audioStates[idx].transcribing = true;

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const base64 = reader.result as string;
      const res = await fetch("/api/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioBase64: base64 }),
      });
      const data = await res.json();

      if (!res.ok) {
        // Handle API errors
        if (data.error?.code === "insufficient_quota") {
          toast.error("Kuota OpenAI habis. Silakan periksa billing Anda.", {
            position: "top-right",
            autoClose: 5000,
          });
        } else {
          toast.error(data.error?.message || "Gagal transkripsi audio", {
            position: "top-right",
            autoClose: 5000,
          });
        }
        return;
      }

      if (data.text) {
        input.value = data.text;
        toast.success("Audio berhasil ditranskripsi!", {
          position: "top-right",
          autoClose: 3000,
        });
        onSend();
      } else {
        toast.warning("Tidak ada teks yang terdeteksi dari audio", {
          position: "top-right",
          autoClose: 4000,
        });
      }
    } catch (e: any) {
      toast.error(e.message || "Gagal transkripsi audio", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      // Reset transcribing state
      audioStates[idx].transcribing = false;
    }
  };
  reader.readAsDataURL(fileObj.file);
}

function handleClickOutside(event: MouseEvent) {
  if (
    filesMenuRef.value &&
    !filesMenuRef.value.contains(event.target as Node)
  ) {
    showFilesMenu.value = false;
  }
}

onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("mousedown", handleClickOutside);
});
</script>
