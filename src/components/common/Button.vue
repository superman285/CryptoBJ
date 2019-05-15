<template>
    <!-- Event when button is clicked -->
    <button @click="$emit('button-clicked')" :class="type">{{ label }}</button>
</template>

<script>
export default {
    name: 'Button',
    props: {
        type: {
            type: String,
        },
        label: {
            type: String,
            required: true,
        },
    },
};
</script>

<style lang="scss" scoped>
.button {
    width: 125px;
    height: 50px;
    background-color: #d80927;
    color: #fff;
    font-size: 20px;
    font-weight: 700;
    text-transform: uppercase;
    border: none;
    border-radius: 50px;
    transition: 0.2s;

    @media (max-width: 767.98px) {
        width: 80px;
        height: 35px;
        font-size: 11px;
    }

    &:hover {
        background-color: #a7071e;
    }
    &:focus {
        outline: none;
    }
    &:disabled {
        outline: none;
    }
}

.fate-btn {
    height: 36px;
    font-size: 15px;
}

.big {
    width: 150px;
    @media (max-width: 767.98px) {
        width: 100px;
    }
}

.huge {
    width: 210px;

    @media (max-width: 767.98px) {
        width: 100px;
    }
}

.rectangle {
    font-weight: 500;
    border-radius: 5px;
}
.green {
    background-color: #157103;

    &:hover {
        background-color: #0c3f02;
    }
}

.red-outline {
    background-color: transparent;
    border: 1.3px solid #d80927;

    &:hover {
        background-color: transparent;
    }
}

.white-outline {
    background-color: transparent;
    border: 1.3px solid #666;

    &:hover {
        background-color: transparent;
    }
}

.clickable {
    &:active {
        box-shadow: 0 4px #bebebe;
        transform: translateY(4px);
    }

    @media (max-width: 767.98px) {
        &:active {
            box-shadow: 0 2px #bebebe;
            transform: translateY(2px);
        }
    }
}
</style>
