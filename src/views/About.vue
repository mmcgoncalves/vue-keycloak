<template>
  <div class="about">
    <ul id="example-1">
      <li v-for="(role, i) in roles" :key="i" >
        {{ role }}
      </li>         
    </ul>
  </div>
</template>

<script>
export default {
  data: () => ({        
    roles: []
  }),
  methods: {
    getRoles() {
      this.$http.get('roles').then(response => {
        this.roles = response.data;            
      })
     .catch(error => {                 
        console.log(error)
      })        
    }
  },

  mounted () {
    this.getRoles()      
  }
}
</script>

