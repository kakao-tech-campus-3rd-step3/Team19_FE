package com.example.musuimsa // 본인 프로젝트의 패키지 이름

import android.Manifest
import android.content.pm.PackageManager
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

class MainActivity : AppCompatActivity() {

    // 나중에 웹뷰를 가리킬 변수를 선언합니다.
    private lateinit var webView: WebView

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

        // 3. 웹뷰가 새 창을 열지 않고 현재 창에서 페이지를 로드하도록 설정합니다.
        webView.webViewClient = WebViewClient()
        
        // 4. 위치정보 사용 가능하게 설정
        webView.settings.setGeolocationEnabled(true)
        
        // 5. 웹페이지에서 위치정보 요청 시 자동 허용
        webView.webChromeClient = object : WebChromeClient() {
            override fun onGeolocationPermissionsShowPrompt(
                origin: String?,
                callback: GeolocationPermissions.Callback?
            ) {
                callback?.invoke(origin, true, false)
            }
        }

        // 6. 웹 로드는 권한 확인 후 진행. 권한 관련 코드 참고.

        // 7. 위치 권한 확인 및 요청
        checkLocationPermissionWithGuide()
        
        // 8. 스마트폰의 '뒤로 가기' 버튼을 처리하는 로직을 추가합니다.
        handleBackButton()
    }

    private fun handleBackButton() {
        // 뒤로 가기 버튼 콜백을 생성합니다.
        val callback = object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                // 웹뷰가 뒤로 갈 페이지가 있다면, 웹페이지의 뒤로 가기를 실행합니다.
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    // 메인(루트) 상태에서는 종료 확인 다이얼로그를 보여주고,
                    // 다이얼로그가 떠 있는 상태에서 한 번 더 뒤로가기를 누르면 종료합니다.
                    showExitConfirmOrExit()
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
            // 이미 권한 허용됨 → 웹 로드
            loadWeb()
        }
    }

    private fun loadWeb() {
        val vercelUrl = "https://team19-fe-rr1d.vercel.app/"
        // 웹뷰 표시로 전환 (검은 배경에서 웹으로)
        webView.visibility = android.view.View.VISIBLE
        webView.setBackgroundColor(android.graphics.Color.BLACK)
        webView.loadUrl(vercelUrl)
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
                // 권한 허용됨 → 웹 로드
                loadWeb()
            } else {
                // 권한 거부됨 - 안내 후 앱 종료
                showPermissionDeniedDialog()
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
}