<template>
    <transition name="modal">
        <div class="modal-mask">
            <div class="modal-wrapper">
                <div class="modal-container" :style="{ width: width }">
                    <img v-if="closable === true" src="../../assets/cancel-btn.png" class="cancel-btn" @click="$emit('close')" alt="cancel" />
                    <slot name="body">default body</slot>
                </div>
            </div>
        </div>
    </transition>
</template>

<script src="./Modal-vue.js"></script>
<style lang="scss" src="./Modal.scss" scoped />
