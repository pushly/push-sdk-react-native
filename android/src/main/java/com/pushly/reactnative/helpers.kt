package com.pushly.reactnative

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.pushly.android.models.PNECommItem

internal fun ReadableArray.toStringList(): List<String> {
    val list = mutableListOf<String>()
    for (index in 0 until size()) {
        list.add(getString(index))
    }
    return list
}

internal fun List<*>.toReadableArray(): ReadableArray {
    val mapped = Arguments.createArray()
    forEach {
        when (it) {
            null -> mapped.pushNull()
            is Boolean -> mapped.pushBoolean(it)
            is Double -> mapped.pushDouble(it)
            is Int -> mapped.pushInt(it)
            is String -> mapped.pushString(it)
            is List<*> -> mapped.pushArray(it.toReadableArray())
            is Map<*, *> -> mapped.pushMap(it.toReadableMap())
        }
    }
    return mapped
}

internal fun Map<*, *>.toReadableMap(): ReadableMap {
    val mapped = Arguments.createMap()
    forEach { (key, value) ->
        when (value) {
            null -> mapped.putNull(key.toString())
            is Boolean -> mapped.putBoolean(key.toString(), value)
            is Double -> mapped.putDouble(key.toString(), value)
            is Int -> mapped.putInt(key.toString(), value)
            is String -> mapped.putString(key.toString(), value)
            is List<*> -> mapped.putArray(key.toString(), value.toReadableArray())
            is Map<*, *> -> mapped.putMap(key.toString(), value.toReadableMap())
        }
    }
    return mapped
}

internal fun PNECommItem.Companion.fromReadableMap(readableMap: ReadableMap) = PNECommItem(
    id = readableMap.getString("id")!!,
    quantity = if (readableMap.hasKey("quantity"))
        readableMap.getInt("quantity")
        else 1
)

internal fun convertToPNECommItemList(readableArray: ReadableArray): List<PNECommItem> {
    val parsedItems = mutableListOf<PNECommItem>()

    for (index in 0 until readableArray.size()) {
        val itemMap = readableArray.getMap(index)
        parsedItems.add(PNECommItem.fromReadableMap(itemMap))
    }

    return parsedItems
}