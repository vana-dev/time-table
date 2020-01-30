<template>
  <div class="home">
    <TimeTable />
  </div>
</template>

<script>
// @ is an alias to /src
import TimeTable from '@/components/TimeTable.vue'

export default {
  name: 'home',
  components: {
    TimeTable
  }
}
</script>
