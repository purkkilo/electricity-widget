package com.anonymous.electricitywidget

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent


class BootHandler : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        try {
            if (intent.action != null) {
                if (intent.action.equals(Intent.ACTION_BOOT_COMPLETED, ignoreCase = true)) {
                    HomeWidget.scheduleUpdates(context)
                    return
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}