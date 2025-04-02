package com.anonymous.electricitywidget

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent


class UpdateHandler : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        try {
            if (intent.action != null) {
                if ((intent.action.equals(
                        Intent.ACTION_MY_PACKAGE_REPLACED,
                        ignoreCase = true
                    )) || (Intent.ACTION_PACKAGE_REPLACED == intent.action && (intent.data!!
                        .schemeSpecificPart == context.packageName))
                ) {
                    HomeWidget.scheduleUpdates(context)
                    return
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}