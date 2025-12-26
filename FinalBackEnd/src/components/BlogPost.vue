<template>
    <div>
        <b>{{ id }} - {{ title }}</b>
        <div>
            {{ description }}
        </div>
    </div>
</template>

<script>
export default {
    props: {
        id: {
            type: Number,
            default: 0
        },
        title: {
            type: String,
            default: "Title ni"
            
        },
        description: {
            type: String,
            default: "Description ni"
        }
    }

}
</script>

<style>

</style>