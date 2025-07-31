package com.anonymous.electricitywidget


import android.app.AlarmManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.database.Cursor
import android.database.sqlite.SQLiteDatabase
import android.os.Build
import android.widget.RemoteViews
import androidx.annotation.RequiresApi
import com.reactnativecommunity.asyncstorage.ReactDatabaseSupplier
import org.json.JSONException
import org.json.JSONObject

import java.time.Duration
import java.time.ZonedDateTime
import androidx.core.graphics.toColorInt


/**
 * Implementation of App Widget functionality.
 */

class HomeWidget : AppWidgetProvider() {

    @RequiresApi(Build.VERSION_CODES.O)
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        val data = getDataFromRNDatabase(
            context
        )

        // There may be multiple widgets active, so update all of them
        appWidgetIds.forEach { appWidgetId ->
            updateAppWidget(context, appWidgetManager, appWidgetId, data)
        }
        scheduleUpdates(context)
    }

    @RequiresApi(Build.VERSION_CODES.O)
    override fun onDeleted(context: Context, appWidgetIds: IntArray) {
        // reschedule update alarm so it does not include ID of currently removed widget
        scheduleUpdates(context)
    }

    override fun onDisabled(context: Context) {
        // disable update alarms
        cancelUpdates(context)
    }

    private fun getActiveWidgetIds(context: Context): IntArray {
        val appWidgetManager = AppWidgetManager.getInstance(context)
        val componentName = ComponentName(context, this::class.java)

        // return ID of all active widgets within this AppWidgetProvider
        return appWidgetManager.getAppWidgetIds(componentName)
    }

    @RequiresApi(Build.VERSION_CODES.O)
    fun scheduleUpdates(context: Context) {
        val activeWidgetIds = getActiveWidgetIds(context)

        if (activeWidgetIds.isNotEmpty()) {

            val nextUpdate = ZonedDateTime.now() + WIDGET_UPDATE_INTERVAL
            val pendingIntent = getUpdatePendingIntent(context)

            context.alarmManager.set(
                AlarmManager.RTC_WAKEUP,
                nextUpdate.toInstant().toEpochMilli(), // alarm time in millis since 1970-01-01 UTC
                pendingIntent
            )
        }
    }

    private fun cancelUpdates(context: Context) {
            val pendingIntent = getUpdatePendingIntent(context)
            context.alarmManager.cancel(pendingIntent)
    }

    private fun getUpdatePendingIntent(context: Context): PendingIntent {
        val widgetClass = this::class.java
        val widgetIds = getActiveWidgetIds(context)
        val updateIntent = Intent(context, widgetClass)
            .setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE)
            .putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, widgetIds)
        val requestCode = widgetClass.name.hashCode()
        val flags = PendingIntent.FLAG_CANCEL_CURRENT or
                PendingIntent.FLAG_IMMUTABLE

        return PendingIntent.getBroadcast(context, requestCode, updateIntent, flags)
    }

    private fun getDataFromRNDatabase(context: Context): JSONObject {

        var catalystLocalStorage: Cursor? = null
        var readableDatabase: SQLiteDatabase? = null
        val columns:  Array<String> = arrayOf("key, value")
        val data = JSONObject()

        try {
            readableDatabase =
                ReactDatabaseSupplier.getInstance(context.applicationContext).readableDatabase
            catalystLocalStorage = readableDatabase.query("catalystLocalStorage", columns, null, null, null, null, null)

            val keyColumn = catalystLocalStorage.getColumnIndexOrThrow("key")
            val valueColumn = catalystLocalStorage.getColumnIndexOrThrow("value")

            if (catalystLocalStorage.moveToFirst()) {
                do {
                    data.put(catalystLocalStorage.getString(keyColumn), catalystLocalStorage.getString(valueColumn))
                } while (catalystLocalStorage.moveToNext())
            }

        } catch (e: Exception) {
            println(e)
        } finally {
            catalystLocalStorage?.close()
            readableDatabase?.close()
        }

        return data
    }

    private fun updateAppWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int,
        data: JSONObject,
    ) {
        val newText: String
        val hLimit: Int
        val mLimit: Int
        val widgetId = R.layout.home_widget
        val textId = R.id.appwidget_text
        var newColor = "#4deeea" // Normal color
        try {
            val ePrice = data.get("electricityPrice").toString().toFloat()

            newText = data.get("electricityPrice").toString()

            hLimit = Integer.parseInt(data.get("highLimit").toString())
            mLimit = Integer.parseInt(data.get("mediumLimit").toString())

            // Construct the RemoteViews object
            val views = RemoteViews(context.packageName, widgetId)
            views.setTextViewText(R.id.appwidget_text, newText)




            // Only set color if negative or over medium limit, don't change between 0 - mLimit
            if(ePrice >= hLimit) {
                newColor = "red"
            }
            if (ePrice >= mLimit) {
                newColor = "yellow"
            }
            if(ePrice <= 0) {
                newColor = "green"
            }


            views.setInt(textId, "setTextColor", newColor.toColorInt())
            // Instruct the widget manager to update the widget
            println("Updating widget $appWidgetId with text $newText")
            println("Color: $newColor | ePrice $ePrice | mLimit: $mLimit | hLimit $hLimit")

            appWidgetManager.updateAppWidget(appWidgetId, views)
        } catch (e: JSONException) {
            e.printStackTrace()
        }
    }

    private val Context.alarmManager: AlarmManager
        get() = getSystemService(Context.ALARM_SERVICE) as AlarmManager

    companion object {
        // For update and boot handlers
        // Correct way?
        fun scheduleUpdates(context: Context) {
            scheduleUpdates(context)
        }

        @RequiresApi(Build.VERSION_CODES.O)
        private val WIDGET_UPDATE_INTERVAL = Duration.ofMinutes(1)
    }

}





