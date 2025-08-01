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

data class DataFromDB(val electricityPrice: String, val pricesToday: String, val pricesTomorrow: String, val pricesYesterday: String, val limits : JSONObject)

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

    private fun getDataFromRNDatabase(context: Context): DataFromDB {
        var catalystLocalStorage: Cursor? = null
        var readableDatabase: SQLiteDatabase? = null
        val columns:  Array<String> = arrayOf("key, value")
        val limits = JSONObject()
        var electricityPrice = ""
        var pricesToday = ""
        var pricesTomorrow = ""
        var pricesYesterday = ""

        try {
            readableDatabase =
                ReactDatabaseSupplier.getInstance(context.applicationContext).readableDatabase
            catalystLocalStorage = readableDatabase.query("catalystLocalStorage", columns, null, null, null, null, null)

            val keyColumn = catalystLocalStorage.getColumnIndexOrThrow("key")
            val valueColumn = catalystLocalStorage.getColumnIndexOrThrow("value")

            if (catalystLocalStorage.moveToFirst()) {
                do {
                    val n = catalystLocalStorage.getString(keyColumn)
                    val v = catalystLocalStorage.getString(valueColumn)

                    when(n) {
                        "electricityPrice" -> electricityPrice = v
                        "prices-today" -> pricesToday = v
                        "prices-tomorrow" -> pricesTomorrow = v
                        "prices-yesterday" -> pricesYesterday = v
                        else -> limits.put(n, v)
                    }
                } while (catalystLocalStorage.moveToNext())
            }


        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            catalystLocalStorage?.close()
            readableDatabase?.close()
        }

        return DataFromDB(electricityPrice,pricesToday,pricesTomorrow, pricesYesterday, limits)
    }

    private fun updateAppWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int,
        dataFromDB: DataFromDB,
    ) {
        try {
            val (electricityPrice, _, _, _, limits) = dataFromDB
            val ePrice = electricityPrice.toFloat()

            val hLimit = limits.get("hLimit").toString().toFloat()
            val  mLimit = limits.get("mLimit").toString().toFloat()

            // Only set color if negative or over medium limit, don't change between 0 - mLimit
            var newColor = "#4deeea" // Normal color
            if(ePrice >= hLimit) {
                newColor = "red"
            }
            else if (ePrice >= mLimit) {
                newColor = "yellow"
            }
            else if(ePrice <= 0) {
                newColor = "green"
            }

            // Construct the RemoteViews object
            val views = RemoteViews(context.packageName, R.layout.home_widget)
            views.setTextViewText(R.id.appwidget_text, electricityPrice)
            views.setInt(R.id.appwidget_text, "setTextColor", newColor.toColorInt())
            views.setInt(R.id.appwidget_unit, "setTextColor", newColor.toColorInt())
            println("Updating widget $appWidgetId with text $electricityPrice")
            // Instruct the widget manager to update the widget
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





