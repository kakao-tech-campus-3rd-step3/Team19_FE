package com.example.musuimsa // 본인 프로젝트의 패키지 이름

import android.Manifest
import android.content.pm.PackageManager
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.webkit.CookieManager
import android.webkit.GeolocationPermissions
import android.webkit.WebSettings
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import android.view.KeyEvent
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import android.webkit.JavascriptInterface
import android.speech.tts.TextToSpeech
import java.util.Locale
import android.webkit.ValueCallback
import android.net.Uri
import android.app.Activity
import android.content.ActivityNotFoundException
import android.location.LocationManager
import android.provider.Settings

class MainActivity : AppCompatActivity() {

    // 나중에 웹뷰를 가리킬 변수를 선언합니다.
    private lateinit var webView: WebView
    
    // TTS(Text-to-Speech) 객체
    private var textToSpeech: TextToSpeech? = null
    
    // 위치 설정 화면 진입 여부 플래그
    private var launchedLocationSettings: Boolean = false

    // 파일 업로드 콜백 (input type="file")
    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private val FILE_CHOOSER_REQUEST_CODE = 1000
    private val PERMISSION_REQUEST_READ_IMAGES = 300

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // 1. XML 레이아웃에 있는 웹뷰를 ID를 이용해 가져옵니다.
        webView = findViewById(R.id.webView)

        // 2. 웹뷰의 설정을 변경합니다. 리액트 웹을 로드하려면 JavaScript 실행이 필수입니다.
        webView.settings.javaScriptEnabled = true

        // 2-1. 인증 관련 웹 저장소 활성화 (토큰/쿠키 지원)
        webView.settings.domStorageEnabled = true      // localStorage 지원 (토큰 저장용)
        webView.settings.databaseEnabled = true        // WebSQL/IndexedDB 지원
        webView.settings.cacheMode = WebSettings.LOAD_DEFAULT // 캐시 정책
        
        // 2-2. 쿠키 매니저 설정 (백업 인증 수단)
        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)                    // 쿠키 허용
        cookieManager.setAcceptThirdPartyCookies(webView, true) // 크로스도메인 쿠키 허용
        
        // 2-3. HTTPS 혼합 콘텐츠 허용 (필요 시)
        webView.settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW

        // 2-3-1. 파일/콘텐츠 접근 허용 (파일 업로드를 위해 필요)
        webView.settings.allowFileAccess = true
        webView.settings.allowContentAccess = true

        // 2-4. JavaScript 브릿지 추가 (웹에서 쿠키 삭제 및 TTS를 위해)
        webView.addJavascriptInterface(WebAppInterface(this), "AndroidBridge")
        
        // 2-5. TTS(Text-to-Speech) 초기화
        textToSpeech = TextToSpeech(this) { status ->
            if (status == TextToSpeech.SUCCESS) {
                val result = textToSpeech?.setLanguage(Locale.KOREAN)
                if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                    android.util.Log.w("MainActivity", "한국어 TTS가 지원되지 않습니다.")
                }
            }
        }

        // 3. 웹뷰가 새 창을 열지 않고 현재 창에서 페이지를 로드하도록 설정합니다.
        webView.webViewClient = WebViewClient()
        
        // 4. 위치정보 사용 가능하게 설정
        webView.settings.setGeolocationEnabled(true)
        
        // 5. 웹페이지에서 위치정보 요청 시 자동 허용 + 파일 업로드 처리
        webView.webChromeClient = object : WebChromeClient() {
            override fun onGeolocationPermissionsShowPrompt(
                origin: String?,
                callback: GeolocationPermissions.Callback?
            ) {
                callback?.invoke(origin, true, false)
            }

            // input type="file" 처리 (갤러리에서 이미지 선택)
            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                // 기존 콜백이 남아있다면 정리
                this@MainActivity.filePathCallback?.onReceiveValue(null)
                this@MainActivity.filePathCallback = filePathCallback

                if (!hasImageReadPermission()) {
                    requestImageReadPermission()
                    return true
                }

                openImageChooser()
                return true
            }
        }

        // 6. 웹 로드는 권한 확인 후 진행. 권한 관련 코드 참고.

        // 7. 알림 권한(Android 13+) 요청
        requestNotificationPermissionIfNeeded()

        // 8. 위치 권한 및 위치 설정 확인
        checkLocationPermissionWithGuide()
        
        // 9. 스마트폰의 '뒤로 가기' 버튼을 처리하는 로직을 추가합니다.
        handleBackButton()
    }

    private fun openImageChooser() {
        try {
            val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
                addCategory(Intent.CATEGORY_OPENABLE)
                type = "image/*"
                putExtra(Intent.EXTRA_MIME_TYPES, arrayOf("image/*"))
                putExtra(Intent.EXTRA_ALLOW_MULTIPLE, false)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION)
            }
            startActivityForResult(intent, FILE_CHOOSER_REQUEST_CODE)
        } catch (e: ActivityNotFoundException) {
            // 대체 인텐트
            try {
                val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "image/*"
                    putExtra(Intent.EXTRA_MIME_TYPES, arrayOf("image/*"))
                }
                startActivityForResult(intent, FILE_CHOOSER_REQUEST_CODE)
            } catch (_: Exception) {
                this.filePathCallback?.onReceiveValue(null)
                this.filePathCallback = null
            }
        }
    }

    private fun hasImageReadPermission(): Boolean {
        return if (Build.VERSION.SDK_INT >= 33) {
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.READ_MEDIA_IMAGES
            ) == PackageManager.PERMISSION_GRANTED
        } else {
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.READ_EXTERNAL_STORAGE
            ) == PackageManager.PERMISSION_GRANTED
        }
    }

    private fun requestImageReadPermission() {
        if (Build.VERSION.SDK_INT >= 33) {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(Manifest.permission.READ_MEDIA_IMAGES),
                PERMISSION_REQUEST_READ_IMAGES
            )
        } else {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(Manifest.permission.READ_EXTERNAL_STORAGE),
                PERMISSION_REQUEST_READ_IMAGES
            )
        }
    }

    private fun handleBackButton() {
        // 뒤로 가기 버튼 콜백을 생성합니다.
        val callback = object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                // 현재 경로가 메인페이지(`/`)인지 확인
                webView.evaluateJavascript("window.location.pathname") { pathname ->
                    val currentPath = pathname?.replace("\"", "") ?: ""
                    
                    // 메인페이지(`/`)이거나 히스토리가 없으면 종료 확인 다이얼로그 표시
                    if (currentPath == "/" || !webView.canGoBack()) {
                        runOnUiThread {
                            showExitConfirmOrExit()
                        }
                    } else {
                        // 다른 페이지에서는 WebView 뒤로가기
                        runOnUiThread {
                            webView.goBack()
                        }
                    }
                }
            }
        }
        // 이 액티비티의 생명주기에 맞춰 콜백을 등록합니다.
        onBackPressedDispatcher.addCallback(this, callback)
    }

    private var exitDialog: androidx.appcompat.app.AlertDialog? = null

    private fun showExitConfirmOrExit() {
        // 다이얼로그가 이미 떠 있다면, 뒤로가기를 두 번째로 누른 것으로 간주하고 종료합니다.
        if (exitDialog?.isShowing == true) {
            exitApp()
            return
        }

        // 큰 글씨 메시지 뷰 구성
        val dialogView = layoutInflater.inflate(android.R.layout.simple_list_item_1, null)
        val textView = dialogView.findViewById<android.widget.TextView>(android.R.id.text1)
        textView.textSize = 32f
        textView.text = "정말 종료하시겠어요?\n한 번 더 뒤로가기를 누르면 종료됩니다."

        // 큰 아이콘 타이틀 구성
        val titleView = android.widget.TextView(this).apply {
            text = "⚠️"
            textSize = 32f
            setTypeface(typeface, android.graphics.Typeface.BOLD)
            gravity = android.view.Gravity.CENTER
            setPadding(32, 32, 32, 16)
        }

        val dialog = androidx.appcompat.app.AlertDialog.Builder(this)
            .setCustomTitle(titleView)
            .setView(dialogView)
            .setPositiveButton("종료") { _, _ ->
                exitApp()
            }
            .setNegativeButton("취소") { d, _ -> d.dismiss() }
            .create()

        // 다이얼로그 표시 중 뒤로가기를 다시 누르면 완전 종료
        dialog.setOnKeyListener { d, keyCode, event ->
            if (keyCode == KeyEvent.KEYCODE_BACK && event.action == KeyEvent.ACTION_UP) {
                d.dismiss()
                exitApp()
                true
            } else {
                false
            }
        }

        dialog.setOnShowListener {
            val positive = dialog.getButton(androidx.appcompat.app.AlertDialog.BUTTON_POSITIVE)
            val negative = dialog.getButton(androidx.appcompat.app.AlertDialog.BUTTON_NEGATIVE)

            positive.textSize = 30f
            negative.textSize = 30f
            positive.isAllCaps = false
            negative.isAllCaps = false
            positive.setPadding(40, 24, 40, 24)
            negative.setPadding(40, 24, 40, 24)

            val density = resources.displayMetrics.density
            val heightPx = (56 * density).toInt()
            positive.layoutParams = positive.layoutParams.apply { height = heightPx }
            negative.layoutParams = negative.layoutParams.apply { height = heightPx }
        }

        exitDialog = dialog
        dialog.show()
    }

    private fun exitApp() {
        finishAffinity() // 태스크의 모든 액티비티 종료 및 태스크 제거
    }
    
    // 위치 권한이 없으면 사용자에게 권한 요청
    // 위치 권한 확인 및 요청 (친절한 안내 포함)
    private fun checkLocationPermissionWithGuide() {
        if (ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            // 먼저 친절한 안내 다이얼로그 표시
            showLocationPermissionGuide()
        } else {
            // 이미 권한 허용됨 → 위치 설정 확인 후 웹 로드
            ensureLocationEnabledThenLoadWeb()
        }
    }

    private fun loadWeb() {
        val vercelUrl = "https://musuimsa-pi.vercel.app/"
        // 웹뷰 표시로 전환 (검은 배경에서 웹으로)
        webView.visibility = android.view.View.VISIBLE
        webView.setBackgroundColor(android.graphics.Color.BLACK)
        webView.loadUrl(vercelUrl)

        // 푸시로 진입한 경우, 웹 로드 직후 딥링크 데이터 전달 시도
        webView.postDelayed({
            tryForwardNotificationExtrasToWeb(intent)
        }, 1200)
    }

    // 단말의 위치 서비스(GPS/네트워크)가 켜져 있는지 확인 후, 꺼져 있으면 설정으로 유도
    private fun ensureLocationEnabledThenLoadWeb() {
        if (isLocationEnabled()) {
            loadWeb()
        } else {
            showTurnOnLocationSettingsDialog()
        }
    }

    private fun isLocationEnabled(): Boolean {
        val locationManager = getSystemService(LOCATION_SERVICE) as LocationManager
        val gpsEnabled = try { locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER) } catch (_: Exception) { false }
        val networkEnabled = try { locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER) } catch (_: Exception) { false }
        return gpsEnabled || networkEnabled
    }

    private fun showTurnOnLocationSettingsDialog() {
        val dialogView = layoutInflater.inflate(android.R.layout.simple_list_item_1, null)
        val textView = dialogView.findViewById<android.widget.TextView>(android.R.id.text1)
        textView.textSize = 32f
        textView.text = "정확한 길안내를 위해\n스마트폰의 위치서비스를 켜주세요.\n\n'설정 열기'를 눌러\n위치 서비스를 활성화해주세요."

        val titleView = android.widget.TextView(this).apply {
            text = "📍"
            textSize = 32f
            setTypeface(typeface, android.graphics.Typeface.BOLD)
            gravity = android.view.Gravity.CENTER
            setPadding(32, 32, 32, 16)
        }

        val dialog = androidx.appcompat.app.AlertDialog.Builder(this)
            .setCustomTitle(titleView)
            .setView(dialogView)
            .setPositiveButton("설정 열기") { _, _ ->
                // 위치 설정 화면으로 이동
                try {
                    launchedLocationSettings = true
                    startActivity(Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS))
                } catch (_: Exception) {
                }
            }
            .setNegativeButton("앱 종료") { _, _ ->
                finish()
            }
            .setCancelable(false)
            .create()

        dialog.setOnShowListener {
            val positive = dialog.getButton(androidx.appcompat.app.AlertDialog.BUTTON_POSITIVE)
            val negative = dialog.getButton(androidx.appcompat.app.AlertDialog.BUTTON_NEGATIVE)
            positive.textSize = 30f
            negative.textSize = 30f
            positive.isAllCaps = false
            negative.isAllCaps = false
            positive.setPadding(40, 24, 40, 24)
            negative.setPadding(40, 24, 40, 24)
            val density = resources.displayMetrics.density
            val heightPx = (56 * density).toInt()
            positive.layoutParams = positive.layoutParams.apply { height = heightPx }
            negative.layoutParams = negative.layoutParams.apply { height = heightPx }
        }

        dialog.show()
    }
    
    // 위치 권한 안내 다이얼로그
    private fun showLocationPermissionGuide() {
        // 커스텀 레이아웃 생성
        val dialogView = layoutInflater.inflate(android.R.layout.simple_list_item_1, null)
        val textView = dialogView.findViewById<android.widget.TextView>(android.R.id.text1)
        
        // 큰 글씨로 설정
        textView.textSize = 32f
        
        // SpannableString으로 볼드체 구현
        val fullText = (
            "무더위 쉼터까지 정확한 길안내를 위해 현재 위치를 알아야 합니다.\n\n" +
            "다음 화면에서\n" +
            "'정확한 위치'를 선택하고\n" +
            "'앱 사용중에만 허용'을 눌러주세요."
        )
        val spannableString = android.text.SpannableString(fullText)
        
        // '정확한 위치' 부분을 볼드체로
        val bold1Start = fullText.indexOf("'정확한 위치'")
        val bold1End = bold1Start + "'정확한 위치'".length
        spannableString.setSpan(
            android.text.style.StyleSpan(android.graphics.Typeface.BOLD),
            bold1Start,
            bold1End,
            android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE
        )
        
        // '앱 사용중에만 허용' 부분을 볼드체로
        val bold2Start = fullText.indexOf("'앱 사용중에만 허용'")
        val bold2End = bold2Start + "'앱 사용중에만 허용'".length
        spannableString.setSpan(
            android.text.style.StyleSpan(android.graphics.Typeface.BOLD),
            bold2Start,
            bold2End,
            android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE
        )

        textView.text = spannableString
        
        // 커스텀 큰 제목
        val titleView = android.widget.TextView(this).apply {
            text = "⚠️"
            textSize = 32f
            setTypeface(typeface, android.graphics.Typeface.BOLD)
            gravity = android.view.Gravity.CENTER
            setPadding(32, 32, 32, 16)
        }

        val dialog = androidx.appcompat.app.AlertDialog.Builder(this)
            .setCustomTitle(titleView)
            .setView(dialogView)
            .setPositiveButton("다음 화면") { _, _ ->
                // 시스템 위치 권한 요청 다이얼로그 표시
                ActivityCompat.requestPermissions(
                    this,
                    arrayOf(Manifest.permission.ACCESS_FINE_LOCATION),
                    100
                )
            }
            .setNegativeButton("앱 종료") { _, _ ->
                finish() // 앱 종료
            }
            .setCancelable(false) // 뒤로가기나 외부 터치로 닫기 불가
            .create()

        dialog.setOnShowListener {
            val positive = dialog.getButton(androidx.appcompat.app.AlertDialog.BUTTON_POSITIVE)
            val negative = dialog.getButton(androidx.appcompat.app.AlertDialog.BUTTON_NEGATIVE)

            // 글자 크기와 패딩 확대
            positive.textSize = 30f
            negative.textSize = 30f
            positive.isAllCaps = false
            negative.isAllCaps = false
            positive.setPadding(40, 24, 40, 24)
            negative.setPadding(40, 24, 40, 24)

            // 버튼 높이 키우기
            val density = resources.displayMetrics.density
            val heightPx = (56 * density).toInt() // 56dp
            positive.layoutParams = positive.layoutParams.apply { height = heightPx }
            negative.layoutParams = negative.layoutParams.apply { height = heightPx }
        }

        dialog.show()
    }
    
    // 권한 요청 결과 처리
    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        
        if (requestCode == 100) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // 권한 허용됨 → 위치 설정 확인 후 웹 로드
                ensureLocationEnabledThenLoadWeb()
            } else {
                // 권한 거부됨 - 안내 후 앱 종료
                showPermissionDeniedDialog()
            }
        } else if (requestCode == 200) {
            // 알림 권한: 허용/거부 모두 앱 동작에는 치명적 영향 없음 → 별도 처리 없이 진행
        }
        else if (requestCode == PERMISSION_REQUEST_READ_IMAGES) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // 권한 허용되면 파일 선택기 열기
                openImageChooser()
            } else {
                // 권한 거부: 콜백에 null 전달하여 종료
                filePathCallback?.onReceiveValue(null)
                filePathCallback = null
            }
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            val callback = filePathCallback
            filePathCallback = null

            if (callback == null) return

            if (resultCode != Activity.RESULT_OK) {
                callback.onReceiveValue(null)
                return
            }

            // 단일 선택 처리
            val uri: Uri? = data?.data
            if (uri != null) {
                // 영구 권한 부여 시도 (ACTION_OPEN_DOCUMENT의 경우)
                try {
                    contentResolver.takePersistableUriPermission(
                        uri,
                        Intent.FLAG_GRANT_READ_URI_PERMISSION
                    )
                } catch (_: Exception) {}
                callback.onReceiveValue(arrayOf(uri))
            } else {
                callback.onReceiveValue(null)
            }
        }
    }
    
    // 권한 거부 시 안내 다이얼로그 표시
    private fun showPermissionDeniedDialog() {
        // 커스텀 레이아웃 생성
        val dialogView = layoutInflater.inflate(android.R.layout.simple_list_item_1, null)
        val textView = dialogView.findViewById<android.widget.TextView>(android.R.id.text1)
        
        // 큰 글씨로 설정
        textView.textSize = 32f
        textView.text = "이 앱은 위치정보가 필요합니다.\n위치 권한을 허용해주세요."
        
        // 커스텀 큰 제목
        val denyTitleView = android.widget.TextView(this).apply {
            text = "⚠️"
            textSize = 32f
            setTypeface(typeface, android.graphics.Typeface.BOLD)
            gravity = android.view.Gravity.CENTER
            setPadding(32, 32, 32, 16)
        }

        val dialog = androidx.appcompat.app.AlertDialog.Builder(this)
            .setCustomTitle(denyTitleView)
            .setView(dialogView)
            .setPositiveButton("앱 종료") { _, _ ->
                finish() // 앱 종료
            }
            .setCancelable(false) // 뒤로가기나 외부 터치로 닫기 불가
            .create()
        
        dialog.setOnShowListener {
            val positive = dialog.getButton(androidx.appcompat.app.AlertDialog.BUTTON_POSITIVE)
            
            // 글자 크기와 패딩 확대
            positive.textSize = 30f
            positive.isAllCaps = false
            positive.setPadding(40, 24, 40, 24)
            
            // 버튼 높이 키우기
            val density = resources.displayMetrics.density
            val heightPx = (56 * density).toInt() // 56dp
            positive.layoutParams = positive.layoutParams.apply { height = heightPx }
        }
        
        dialog.show()
    }
    
    // TTS 정리 (액티비티 종료 시)
    override fun onDestroy() {
        textToSpeech?.stop()
        textToSpeech?.shutdown()
        textToSpeech = null
        super.onDestroy()
    }
    
    // WebAppInterface에서 TTS 접근을 위한 getter
    fun getTextToSpeech(): TextToSpeech? = textToSpeech

    // 저장된 FCM 토큰을 반환 (웹에서 JS 브릿지를 통해 조회)
    fun getStoredFcmToken(): String? =
        MyFirebaseMessagingService.getStoredFcmToken(this)

    // Android 13+ 알림 권한 요청
    private fun requestNotificationPermissionIfNeeded() {
        if (Build.VERSION.SDK_INT >= 33) {
            val granted = ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
            if (!granted) {
                ActivityCompat.requestPermissions(
                    this,
                    arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                    200
                )
            }
        }
    }

    // 푸시 알림 클릭으로 전달된 extras를 WebView로 전달하고 라우팅합니다.
    private fun tryForwardNotificationExtrasToWeb(srcIntent: Intent?) {
        val extras = srcIntent?.extras ?: return
        val map = mutableMapOf<String, String>()
        for (key in extras.keySet()) {
            if (key.startsWith("notif_")) {
                val v = extras.get(key)?.toString() ?: continue
                map[key.removePrefix("notif_")] = v
            }
        }
        if (map.isEmpty()) return

        val json = org.json.JSONObject(map as Map<*, *>).toString()
        val js = "(function(){try{sessionStorage.setItem('notifData', " +
                org.json.JSONObject.quote(json) +
                "); if (window.location.pathname !== '/find-shelters'){ window.location.href='/find-shelters?from=notification'; }}catch(e){}})();"
        webView.evaluateJavascript(js, null)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        // 액티비티가 살아있는 상태에서 알림 클릭 시 호출
        tryForwardNotificationExtrasToWeb(intent)
    }

    override fun onResume() {
        super.onResume()
        // 설정 화면에서 돌아왔을 때 위치가 켜졌다면 웹 로드 진행
        if (launchedLocationSettings) {
            launchedLocationSettings = false
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                if (isLocationEnabled()) {
                    loadWeb()
                } else {
                    showTurnOnLocationSettingsDialog()
                }
            }
        }
    }
}

/**
 * JavaScript에서 호출할 수 있는 네이티브 함수를 제공하는 인터페이스
 * 웹에서 로그아웃 시 WebView의 쿠키를 삭제하고, TTS를 사용하기 위해 사용됩니다.
 */
class WebAppInterface(private val activity: MainActivity) {
    
    /**
     * WebView의 모든 쿠키를 삭제합니다.
     * JavaScript에서 AndroidBridge.clearCookies()로 호출할 수 있습니다.
     */
    @JavascriptInterface
    fun clearCookies() {
        activity.runOnUiThread {
            val cookieManager = CookieManager.getInstance()
            cookieManager.removeAllCookies(null)
            cookieManager.flush()
        }
    }
    
    /**
     * 텍스트를 음성으로 변환하여 읽어줍니다.
     * JavaScript에서 AndroidBridge.speakText(text)로 호출할 수 있습니다.
     * @param text 읽어줄 텍스트
     */
    @JavascriptInterface
    fun speakText(text: String) {
        activity.runOnUiThread {
            val tts = activity.getTextToSpeech()
            tts?.let {
                // 이전 음성 중단
                it.stop()
                // 새 음성 재생 (QUEUE_FLUSH: 즉시 재생, 기존 큐 무시)
                it.speak(text, TextToSpeech.QUEUE_FLUSH, null, null)
            }
        }
    }
    
    /**
     * 현재 재생 중인 음성을 중단합니다.
     * JavaScript에서 AndroidBridge.stopSpeaking()로 호출할 수 있습니다.
     */
    @JavascriptInterface
    fun stopSpeaking() {
        activity.runOnUiThread {
            activity.getTextToSpeech()?.stop()
        }
    }

    /**
     * 저장된 FCM 디바이스 토큰을 반환합니다.
     * JavaScript에서 AndroidBridge.getDeviceToken()으로 호출할 수 있습니다.
     */
    @JavascriptInterface
    fun getDeviceToken(): String? {
        return activity.getStoredFcmToken()
    }
}