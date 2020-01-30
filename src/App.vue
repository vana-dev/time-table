<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Lato:400,700&display=swap&subset=latin-ext');

html, body {
  font-family: 'Lato', Helvetica, Arial, sans-serif;
  color: #2c3e50;
  font-size: 14px;
  line-height: 1.2;
}
*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .2s ease;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
.btn-container {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin: 20px 0 0 0;
}
.btn {
  background-color: red;
  border-radius: 8px;
  border: none;
  outline: none;
  box-shadow: none;
  padding: 10px 20px;
  margin: 0 0 0 10px;
  line-height: 1;
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  &--small {
    padding: 0;
    margin: 0 10px;
    font-size: 20px;
    background-color: #f30000;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
}
.errors {
  color: #ff0000;
  font-size: 14px;
  font-weight: bold;
}
.input {
  outline: none;
  border: none;
  padding: 14px;
  font-size: 15px;
  font-family: inherit;
  box-shadow: inset 0 0 0 2px #eee;
  background-color: #fff;
  border-radius: 8px;
  width: 100%;
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;
  &--select {
    cursor: pointer;
  }
}
.label {
  font-size: 14px;
  margin: 0 0 4px 0;
  font-weight: bold;
  color: #000;
}
.form, .form-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.form-group {
  margin: 0 0 20px 0;
}
.modal {
  position: fixed;
  top:0;
  left: 0;
  z-index: 9;
  width: 100%;
  height: 100%;
  background-color: rgba(255,255,255,0.8);
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  .modal-container {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    min-width: 500px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    box-shadow: 0 0 40px rgba(0,0,0,0.1);
    .modal-title {
      margin: 0 0 20px 0;
    }
  }
}
</style>
