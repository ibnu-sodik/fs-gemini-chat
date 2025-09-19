<script setup lang="ts">
import type { Message } from "@/composables/useChat";
defineProps<{ message: Message }>();
</script>

<template>
  <div
    :class="[
      'px-4 py-2 rounded-lg max-w-xl break-words',
      message.role === 'user'
        ? 'bg-blue-500 text-white self-end'
        : 'bg-gray-300 text-black self-start',
    ]"
  >
    {{ message.content }}
  </div>
</template>
