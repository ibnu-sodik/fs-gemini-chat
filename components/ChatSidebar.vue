<script setup lang="ts">
import SidebarHeader from "./sidebar/SidebarHeader.vue";
import SidebarActions from "./sidebar/SidebarActions.vue";
import SessionList from "./sidebar/SessionList.vue";
import SidebarFooter from "./sidebar/SidebarFooter.vue";
import SessionDeleteModal from "./sidebar/SessionDeleteModal.vue";

const props = defineProps<{
  isOpen?: boolean;
}>();

const emit = defineEmits(["close"]);

// Add watcher to debug prop changes
// State for delete modal
const showDeleteModal = ref(false);
const sessionToDelete = ref<{ id: string; title: string } | null>(null);
const sidebarRef = ref<HTMLElement | null>(null);

function handleSessionDelete(session: { id: string; title: string }) {
  sessionToDelete.value = session;
  showDeleteModal.value = true;
}

function handleDeleteModalClose() {
  showDeleteModal.value = false;
  sessionToDelete.value = null;
}

async function handleDeleteConfirm(data: {
  sessionId: string;
  isActiveSession: boolean;
}) {
  showDeleteModal.value = false;
  sessionToDelete.value = null;

  // If the deleted session was active, redirect to home
  if (data.isActiveSession) {
    // Add small delay to ensure state is cleared
    await new Promise((resolve) => setTimeout(resolve, 100));
    await navigateTo("/chat");
  }
}

// Close sidebar when clicking outside (mobile)
function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement;

  // Cek apakah yang diklik adalah hamburger button atau bagian dari hamburger button
  const isHamburgerButton = target.closest('[aria-label="Toggle sidebar"]');

  if (
    sidebarRef.value &&
    !sidebarRef.value.contains(target) &&
    !isHamburgerButton
  ) {
    emit("close");
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div class="relative">
    <!-- Backdrop -->
    <div
      v-if="props.isOpen"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[50] md:hidden"
      @click="emit('close')"
    ></div>

    <!-- Sidebar -->
    <aside
      ref="sidebarRef"
      :class="[
        'fixed md:relative inset-y-0 left-0 z-[60] w-64 bg-white border-r border-gray-200 flex flex-col h-full transition-transform duration-300 ease-in-out md:translate-x-0',
        props.isOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <!-- Header Section -->
      <SidebarHeader @close="emit('close')" />

      <!-- Actions Section -->
      <SidebarActions @close="emit('close')" />

      <!-- Sessions List -->
      <SessionList
        @close="emit('close')"
        @session-delete="handleSessionDelete"
      />

      <!-- Footer Section (User Profile) -->
      <SidebarFooter />
    </aside>

    <!-- Delete Confirmation Modal -->
    <SessionDeleteModal
      :isOpen="showDeleteModal"
      :session="sessionToDelete"
      @close="handleDeleteModalClose"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>
