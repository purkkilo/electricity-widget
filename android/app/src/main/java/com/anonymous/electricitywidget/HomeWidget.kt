package com.anonymous.electricitywidget


import android.app.AlarmManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Build
import android.widget.RemoteViews
import androidx.annotation.RequiresApi
import org.json.JSONException
import java.time.Duration
import java.time.ZonedDateTime

/**
 * Implementation of App Widget functionality.
 */
class HomeWidget : AppWidgetProvider() {
    private val prefsFile : String = "com.anonymous.electricitywidget_preferences"
    private val keys : Array<String> = arrayOf("electricityPrice","mediumLimit","highLimit")

    @RequiresApi(Build.VERSION_CODES.O)
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        val sharedPref = context.getSharedPreferences(prefsFile, Context.MODE_PRIVATE)
        // There may be multiple widgets active, so update all of them
        appWidgetIds.forEach { appWidgetId ->
            updateAppWidget(context, appWidgetManager, appWidgetId, sharedPref, keys)
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


internal fun updateAppWidget(
    context: Context,
    appWidgetManager: AppWidgetManager,
    appWidgetId: Int,
    sharedPref: SharedPreferences,
    keys: Array<String>
) {
    try {
        val ePrice = sharedPref.getString(keys[0], "{\"text\":''}").toString()
        //val mLimit = sharedPref.getString(keys[1], "{\"text\":''}").toString()
        //val hLimit = sharedPref.getString(keys[2], "{\"text\":''}").toString()

        // Construct the RemoteViews object
        val views = RemoteViews(context.packageName, R.layout.home_widget)
        views.setTextViewText(R.id.appwidget_text, ePrice)
        // Instruct the widget manager to update the widget
        println("Updating widget $appWidgetId with text $ePrice")
        appWidgetManager.updateAppWidget(appWidgetId, views)
    } catch (e: JSONException) {
        e.printStackTrace()
    }
}