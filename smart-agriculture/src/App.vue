<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { userStore } from '@/stores/userStore'

// 全局提供 userStore
import { provide } from 'vue'
provide('userStore', userStore)
</script>