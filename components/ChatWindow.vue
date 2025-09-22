<template>
  <div class="h-full bg-white flex flex-col">
    <!-- Chat Messages -->
    <div
      ref="chatListRef"
      class="flex-1 overflow-y-auto p-6 space-y-4"
      style="min-height: 0"
    >
      <div
        v-for="(m, idx) in messages"
        :key="m.id"
        :class="[
          'px-4 py-2 w-fit ',
          m.role === 'user'
            ? 'max-w-[80vw] md:max-w-xl rounded-lg shadow ml-auto bg-gray-200 text-gray-900'
            : 'mr-auto',
        ]"
      >
        <!-- Pesan user: tampilkan file dan/atau text -->
        <template v-if="m.role === 'user'">
          <!-- Tampilkan file dari DB atau dari local bubble jika baru dikirim -->
          <template v-if="m.files && m.files.length">
            <div class="flex flex-row gap-2 items-center flex-wrap mb-2">
              <template v-for="(file, fidx) in m.files" :key="file.id || fidx">
                <template v-if="file.type && file.type.startsWith('image')">
                  <img
                    :src="file.base64"
                    alt="preview"
                    class="w-16 h-16 object-cover rounded border border-gray-300 cursor-pointer"
                    @click="() => handleDbPreview(file)"
                  />
                </template>
                <template v-else>
                  <div
                    class="flex items-center gap-2 cursor-pointer p-2 h-16 border border-gray-300 rounded"
                    @click="() => handleDbPreview(file)"
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
                    <span class="text-sm font-medium">{{ file.name }}</span>
                  </div>
                </template>
              </template>
            </div>
            <span v-if="m.content">{{ m.content }}</span>
          </template>
          <!-- Jika tidak ada file, tampilkan hanya text -->
          <template v-else>
            <span>{{ m.content }}</span>
          </template>
        </template>
        <!-- Pesan loading -->
        <span v-else-if="m.id === 'loading'">
          <span class="flex items-center gap-2">
            <svg class="animate-spin h-4 w-4 text-blue-500" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
                fill="none"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
            <span class="text-gray-500">Gemini is typing...</span>
          </span>
        </span>
        <!-- Pesan Gemini -->
        <span
          v-else-if="m.role === 'assistant'"
          v-html="formatAI(displayedContent[m.id] || '')"
        ></span>
      </div>
    </div>

    <div class="px-4 pb-4 pt-1 shadow-xl">
      <div
        id="div-recording"
        v-show="showRecording"
        class="rounded-full border p-2 bg-white flex flex-row items-center justify-between"
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
              <path
                d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"
              />
            </svg>
          </button>
        </div>

        <div class="flex-1 flex flex-col justify-center px-2">
          <div
            v-show="isRecording"
            ref="wavesurferRef"
            class="h-10 w-full bg-gray-100 rounded-lg"
            style="min-width: 0"
          ></div>
          <div v-if="!isRecording" class="text-xs text-gray-500 mt-2">
            <span v-if="recordedAudio"
              >Rekaman selesai, klik Done untuk transkripsi</span
            >
            <span v-else>Siap merekam</span>
          </div>
        </div>
        <div class="flex justify-end gap-2 items-center">
          <button
            type="button"
            class="flex items-center justify-center w-7 h-7 rounded-full hover:bg-gray-200 cursor-pointer"
            title="Cancel"
            @click="cancelRecording"
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
            class="flex items-center justify-center w-7 h-7 rounded-full hover:bg-gray-200 cursor-pointer"
            title="Done"
            @click="confirmRecording"
            :disabled="!recordedAudio"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 -960 960 960"
              class="h-5 w-5"
              fill="#000"
            >
              <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
            </svg>
          </button>
        </div>
      </div>

      <div
        id="div-inputan"
        v-show="!showRecording"
        class="border rounded-lg px-2 py-2"
      >
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
                  @click="handlePreview(idx)"
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
                    class="ml-2 px-2 py-1 bg-green-100 rounded text-xs text-green-700 hover:bg-green-200"
                    title="Transcribe"
                  >
                    Transcribe
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
                    class="ml-2 px-2 py-1 bg-green-100 rounded text-xs text-green-700 hover:bg-green-200"
                    title="Transcribe"
                  >
                    Transcribe
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
                    class="ml-2 px-2 py-1 bg-green-100 rounded text-xs text-green-700 hover:bg-green-200"
                    title="Transcribe"
                  >
                    Transcribe
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
                v-model="selectedModel"
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
            <!-- Tombol rekam suara -->
            <button
              type="button"
              class="mr-2 hover:bg-gray-200 flex items-center justify-center w-7 h-7 rounded-full cursor-pointer"
              title="Rekam suara"
              @click="
                showRecording = true;
                startRecording();
              "
              :class="isRecording ? 'bg-red-200' : ''"
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
              @click="handleSend"
              :disabled="isLoading"
              :class="[
                'flex items-center justify-center w-7 h-7 text-white rounded-full cursor-pointer shadow-md',
                isLoading ? 'bg-gray-200/70' : 'bg-black',
              ]"
              title="Kirim"
            >
              <svg
                v-if="isLoading"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 -960 960 960"
                class="h-5 w-5 animate-ping"
                fill="#000"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M320-640v320-320Zm-80 400v-480h480v480H240Zm80-80h320v-320H320v320Z"
                />
              </svg>
              <svg
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
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal preview image -->
    <div
      v-if="showImageModal"
      class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded shadow-lg pt-8 px-4 pb-4 relative">
        <img
          :src="modalImageUrl"
          alt="preview"
          class="max-w-[80vw] max-h-[80vh] rounded"
        />
        <button
          @click="showImageModal = false"
          class="absolute top-1 right-2 text-gray-700 cursor-pointer hover:text-gray-900"
        >
          ✕
        </button>
      </div>
    </div>
    <!-- Modal preview pdf -->
    <div
      v-if="showPdfModal"
      class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
    >
      <div
        class="bg-white rounded shadow-lg pt-8 px-4 pb-4 relative max-w-[90vw] max-h-[90vh]"
      >
        <embed
          :src="modalPdfUrl"
          type="application/pdf"
          class="w-[70vw] h-[80vh]"
          @error="pdfLoadError = true"
        />
        <div v-if="pdfLoadError" class="text-center mt-4">
          <p class="text-sm text-gray-700">
            Preview PDF tidak didukung di perangkat ini.
          </p>
          <a :href="modalPdfUrl" download class="text-blue-600 underline"
            >Download PDF</a
          >
        </div>
        <button
          @click="showPdfModal = false"
          class="absolute top-1 right-2 text-gray-700 cursor-pointer hover:text-gray-900"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js";
import { ref as vueRef } from "vue";
import { reactive } from "vue";
const audioStates = reactive<{
  [idx: number]: {
    status: "idle" | "playing" | "paused";
    audio?: HTMLAudioElement;
  };
}>({});

// NOTE - Declaration var
const wavesurferRef = ref<HTMLDivElement | null>(null);
let wavesurfer: any = null;
let record: any = null;
const showRecording = vueRef(false);

const isRecording = ref(false);
const recordedAudio = ref<string>("");
const audioBlob = ref<Blob | null>(null);
let didCancelRecording = false;

async function startRecording() {
  didCancelRecording = false;

  if (wavesurfer) {
    wavesurfer.destroy();
    wavesurfer = null;
    record = null;
  }
  if (wavesurferRef.value) {
    wavesurfer = WaveSurfer.create({
      container: wavesurferRef.value,
      waveColor: "#3b82f6",
      progressColor: "#2563eb",
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
        recordedAudio.value = reader.result as string;
        if (!didCancelRecording) {
          await transcribeAudio(recordedAudio.value);
        }
      };
      reader.readAsDataURL(blob);
      // destroy wavesurfer after record
      if (wavesurfer) {
        wavesurfer.destroy();
        wavesurfer = null;
        record = null;
      }
    });

    record.on("record-progress", (time: number) => {
      // Optionally update UI with time
    });
    await record.startRecording();
    isRecording.value = true;
  }
}

function stopRecording() {
  if (record && isRecording.value) {
    record.stopRecording();
    isRecording.value = false;
    // wavesurfer destroyed in record-end
  }
}

function cancelRecording() {
  didCancelRecording = true;
  if (isRecording.value) stopRecording();
  showRecording.value = false;
  recordedAudio.value = "";
  audioBlob.value = null;
}

async function confirmRecording() {
  if (!recordedAudio.value) return;
  showRecording.value = false;
  // Transcribe and put result in input field
  const res = await fetch("/api/speech", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audioBase64: recordedAudio.value }),
  });
  const data = await res.json();
  if (data.text) {
    input.value = data.text;
  } else {
    alert("Gagal transkripsi audio");
  }
  recordedAudio.value = "";
  audioBlob.value = null;
}

// NOTE - Audio play/pause/stop state management

function playAudio(idx: number) {
  const fileObj = uploadedFiles.value[idx];
  if (!fileObj || !fileObj.isAudio) return;
  // Stop any other playing audio
  Object.keys(audioStates).forEach((key) => {
    const i = Number(key);
    if (audioStates[i]?.audio && i !== idx) {
      audioStates[i].audio!.pause();
      audioStates[i].audio!.currentTime = 0;
      audioStates[i].status = "idle";
    }
  });
  // If already have audio instance, resume
  if (audioStates[idx]?.audio) {
    audioStates[idx].audio!.play();
    audioStates[idx].status = "playing";
    return;
  }
  // Create new audio instance
  const audio = new Audio(fileObj.previewUrl);
  audioStates[idx] = { status: "playing", audio };
  audio.play();
  audio.onended = () => {
    audioStates[idx].status = "idle";
  };
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
  const reader = new FileReader();
  reader.onload = async () => {
    const base64 = reader.result as string;
    await transcribeAudio(base64);
  };
  reader.readAsDataURL(fileObj.file);
}

async function transcribeAudio(audioBase64: string) {
  // Kirim audio ke backend untuk transkripsi
  const res = await fetch("/api/speech", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audioBase64 }),
  });
  const data = await res.json();
  if (data.text) {
    input.value = data.text;
    // Otomatis kirim ke Gemini
    handleSend();
  } else {
    alert("Gagal transkripsi audio");
  }
}

// State untuk hide thumbnail setelah kirim
const showThumbnails = ref(false);
import { marked } from "marked";
import { useChat } from "@/composables/useChat";
import { nextTick, ref, watch } from "vue";
const { messages, input, send, isLoading, setModel, uploadedFiles } = useChat();

const chatListRef = ref<HTMLElement | null>(null);
const displayedContent = ref<{ [id: string]: string }>({});
const inputRef = ref<HTMLTextAreaElement | null>(null);

const modelOptions = [
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
];
const selectedModel = ref(modelOptions[0].value);
const showFilesMenu = ref(false);

const filesMenuRef = ref<HTMLElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
// uploadedFiles sekarang diambil dari useChat agar sinkron dengan backend
const showImageModal = ref(false);
const showPdfModal = ref(false);
const modalImageUrl = ref("");
const modalPdfUrl = ref("");
const pdfLoadError = ref(false);

watch([messages, selectedModel], ([newMessages, val], [oldMessages]) => {
  // Jika pesan sudah di-refresh (balasan Gemini sudah masuk), tampilkan thumbnail lagi untuk input berikutnya
  showThumbnails.value = false;
  scrollToBottom();
  newMessages.forEach((msg: any) => {
    if (!msg.isAIResponse) {
      displayedContent.value[msg.id] = msg.content;
    }
  });
  const lastMsg = newMessages[newMessages.length - 1];
  if (
    lastMsg &&
    lastMsg.role === "assistant" &&
    lastMsg.isAIResponse &&
    !displayedContent.value[lastMsg.id]
  ) {
    animateMessage(lastMsg.id, lastMsg.content);
  }
  if (val !== undefined) {
    setModel(val);
  }
});

onMounted(() => {
  setModel(selectedModel.value);
  document.addEventListener("mousedown", handleClickOutside);
});

onBeforeMount(() => {
  document.removeEventListener("mousedown", handleClickOutside);
});

onUnmounted(() => {
  // visualizer handled by wavesurfer.js
  document.removeEventListener("mousedown", handleClickOutside);
});

function handleDbPreview(file: any) {
  if (file.type.startsWith("image")) {
    modalImageUrl.value = file.base64;
    showImageModal.value = true;
  } else if (file.type === "application/pdf") {
    modalPdfUrl.value = file.base64;
    pdfLoadError.value = false;
    showPdfModal.value = true;
  } else {
    // Untuk file selain image/pdf, bisa download
    window.open(file.base64, "_blank");
  }
}
function handleSend() {
  // Only hide thumbnails if not recording
  if (!showRecording.value) {
    showThumbnails.value = false;
    send();
  }
}

function handlePreview(idx: number) {
  const fileObj = uploadedFiles.value[idx];
  if (fileObj.isImage) {
    modalImageUrl.value = fileObj.previewUrl;
    showImageModal.value = true;
  } else if (fileObj.isPdf) {
    modalPdfUrl.value = fileObj.previewUrl;
    pdfLoadError.value = false;
    showPdfModal.value = true;
  }
}

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
  pdfLoadError.value = false;
  showThumbnails.value = true;
  if (fileInputRef.value) fileInputRef.value.value = "";
}

function optionFiles() {
  if (fileInputRef.value) fileInputRef.value.click();
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

function handleClickOutside(event: MouseEvent) {
  if (
    filesMenuRef.value &&
    !filesMenuRef.value.contains(event.target as Node)
  ) {
    showFilesMenu.value = false;
  }
}

function resizeTextarea() {
  const el = inputRef.value;
  if (!el) return;
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 192) + "px";
  el.style.overflowY = el.scrollHeight > 192 ? "auto" : "hidden";
}

function scrollToBottom() {
  nextTick(() => {
    setTimeout(() => {
      if (chatListRef.value) {
        chatListRef.value.scrollTop = chatListRef.value.scrollHeight;
      }
    }, 50);
  });
}

function handleEnter(e: KeyboardEvent) {
  if (e.ctrlKey && e.key === "Enter") {
    e.preventDefault();
    send();
    scrollToBottom();
  }
}

function formatAI(text: string) {
  return marked.parse(text);
}

// Animasi typing untuk pesan Gemini
function animateMessage(id: string, content: string) {
  displayedContent.value[id] = "";
  let i = 0;
  const interval = setInterval(() => {
    displayedContent.value[id] += content[i];
    i++;
    scrollToBottom();
    if (i >= content.length) clearInterval(interval);
  }, 20); // 20ms per huruf, bisa diubah
}

// Animasi per kata:
// function animateMessage(id: string, content: string) {
//   const words = content.split(" ");
//   displayedContent.value[id] = "";
//   let i = 0;
//   const interval = setInterval(() => {
//     displayedContent.value[id] += (i > 0 ? " " : "") + words[i];
//     i++;
//     scrollToBottom();
//     if (i >= words.length) clearInterval(interval);
//   }, 150); // 150ms per kata
// }

// Animasi per kalimat:
// function animateMessage(id: string, content: string) {
//   const sentences = content.split(/([.!?])\s*/);
//   displayedContent.value[id] = "";
//   let i = 0;
//   const interval = setInterval(() => {
//     displayedContent.value[id] += sentences[i];
//     i++;
//     scrollToBottom();
//     if (i >= sentences.length) clearInterval(interval);
//   }, 300); // 300ms per kalimat
// }
</script>
