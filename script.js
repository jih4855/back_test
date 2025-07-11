// 암호화폐 자동매매 대시보드 JavaScript
// 환경별 API 서버 주소 설정
const API_CONFIGS = {
    production_https: 'https://port-0-new-llm-coin-m47ujor8ea8a318c.sel4.cloudtype.app',  // HTTPS 서버 (8443 포트에서 실행 중인 것 같음)
    cors_proxy: 'https://cors-anywhere.herokuapp.com/http://223.130.129.204:8080',  // CORS 프록시
    allorigins_proxy: 'https://api.allorigins.win/raw?url=http://223.130.129.204:8080',  // 대안 프록시
    corsproxy_io: 'https://corsproxy.io/?http://223.130.129.204:8080',  // 다른 CORS 프록시
    thingproxy: 'https://thingproxy.freeboard.io/fetch/http://223.130.129.204:8080',  // 또 다른 프록시
    demo: 'demo'  // 데모 모드
};

// 현재 환경 감지
const isGitHubPages = window.location.hostname.includes('github.io');
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname.includes('localhost');
const isHTTPS = window.location.protocol === 'https:';

// 환경별 API URL 결정
let API_BASE_URL;
let USE_PROXY = false;
let USE_DEMO_MODE = false;

// [추가] 모든 환경에서 Cloudtype FastAPI 서버로 강제 연결
API_BASE_URL = 'https://port-0-new-llm-coin-m47ujor8ea8a318c.sel4.cloudtype.app'; // 항상 이 주소로 연결

// 🔒 API 인증 키 (보안 강화)
const API_KEY = 'default_secure_key_2024';

console.log(`현재 환경: ${isGitHubPages ? 'GitHub Pages (HTTPS)' : (isDevelopment ? 'Development' : 'Production')}`);
console.log(`API 서버: ${API_BASE_URL}`);
console.log(`프록시 사용: ${USE_PROXY}`);

// 데모 데이터 생성
function generateDemoData() {
    const now = new Date();
    const formatTime = (date) => date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    // 현재 포지션 데모 데이터
    const demoPositions = {
        accounts: [
            {
                account_name: "main",
                positions: [
                    {
                        side: "short",
                        size: 0.22,
                        avg_price: 144.78,
                        leverage: 50,
                        notional_usd: 31.85,
                        unrealized_pnl: 0,
                        unrealized_pnl_pct: 0
                    }
                ]
            },
            {
                account_name: "sub",
                positions: []
            }
        ]
    };

    // 거래 내역 데모 데이터
    const demoTrades = {
        date: now.toISOString().split('T')[0],
        accounts: [
            {
                name: "main",
                total_trades: 5,
                net_pnl: 2.45,
                win_rate: 60.0,
                summary: "total 5 trades, net PnL $2.45, win rate 60.0%",
                detailed_trades: [
                    {
                        symbol: "SOL-USDT-SWAP",
                        direction: "long",
                        open_price: 142.50,
                        close_price: 145.20,
                        size: 0.15,
                        leverage: 50,
                        pnl: 1.82,
                        pnl_ratio: 1.89,
                        fee: 0.12,
                        open_time: "14:25:30",
                        close_time: "15:42:15"
                    },
                    {
                        symbol: "SOL-USDT-SWAP",
                        direction: "short",
                        open_price: 146.80,
                        close_price: 144.10,
                        size: 0.18,
                        leverage: 50,
                        pnl: 2.16,
                        pnl_ratio: 1.84,
                        fee: 0.08,
                        open_time: "12:15:45",
                        close_time: "13:28:12"
                    }
                ]
            },
            {
                name: "sub",
                total_trades: 0,
                net_pnl: 0.00,
                win_rate: 0.0,
                summary: "total 0 trades, net PnL $0.00, win rate 0.0%",
                detailed_trades: []
            }
        ]
    };

    return { positions: demoPositions, trades: demoTrades };
}

// 데모 모드 fetch 함수
async function demoFetch(url) {
    console.log(`🎭 데모 데이터 로드: ${url}`);
    
    // 실제 API 호출을 시뮬레이션 (약간의 지연)
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
    
    const demoData = generateDemoData();
    
    if (url.includes('/positions')) {
        return {
            ok: true,
            json: async () => demoData.positions
        };
    } else if (url.includes('/daily-report')) {
        return {
            ok: true,
            json: async () => demoData.trades
        };
    } else {
        return {
            ok: true,
            json: async () => ({ message: "데모 API 서버가 정상 작동 중입니다.", status: "demo" })
        };
    }
}

// 통합 fetch 함수
async function unifiedFetch(url, options = {}) {
    if (USE_DEMO_MODE) {
        return await demoFetch(url);
    }
    
    // Cloudtype HTTPS 서버 직접 연결 (GitHub Pages 환경)
    if (isGitHubPages && url.includes('https://port-0-new-llm-coin-m47ujor8ea8a318c.sel4.cloudtype.app')) {
        try {
            console.log(`🔐 Cloudtype FastAPI 서버 직접 연결 시도: ${url}`);
            const response = await fetch(url, {
                ...options,
                mode: 'cors',
                headers: {
                    'X-API-Key': API_KEY,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            
            if (response.ok) {
                console.log('✅ Cloudtype FastAPI 서버 연결 성공!');
                return response;
            } else {
                console.warn(`❌ Cloudtype 서버 응답 오류: ${response.status} ${response.statusText}`);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error(`❌ Cloudtype 서버 연결 실패: ${error.message}`);
            console.log('🎭 데모 모드로 전환');
            showProxyFailureNotice();
            return await demoFetch(url);
        }
    }
    
    // 프록시 사용 환경
    if (USE_PROXY) {
        return await proxyFetch(url, options);
    }
    
    // 로컬 개발 환경에서만 직접 호출
    const response = await fetch(url, {
        ...options,
        mode: 'cors',
        headers: {
            'X-API-Key': API_KEY,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
}

// 여러 프록시 서비스를 시도하는 향상된 fetch
async function proxyFetch(url, options = {}) {
    if (!USE_PROXY) {
        return await fetch(url, options);
    }
    
    // 시도할 프록시 서비스들 (순서대로 시도)
    const proxyServices = [
        {
            name: 'AllOrigins',
            getUrl: (targetUrl) => `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`
        },
        {
            name: 'CorsProxy.io', 
            getUrl: (targetUrl) => `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`
        },
        {
            name: 'ThingProxy',
            getUrl: (targetUrl) => `https://thingproxy.freeboard.io/fetch/${targetUrl}`
        },
        {
            name: 'CorsAnywhere',
            getUrl: (targetUrl) => `https://cors-anywhere.herokuapp.com/${targetUrl}`
        }
    ];
    
    // 전체 URL 구성 - HTTP 서버로 강제 변경 (프록시용)
    let targetUrl = url;
    if (url.includes('/positions')) {
        targetUrl = `http://223.130.129.204:8080/positions`;
    } else if (url.includes('/daily-report')) {
        targetUrl = `http://223.130.129.204:8080/daily-report`;
    } else {
        targetUrl = `http://223.130.129.204:8080/`;
    }
    
    console.log(`🎯 타겟 FastAPI 서버: ${targetUrl}`);
    
    // 각 프록시 서비스를 차례로 시도
    for (let i = 0; i < proxyServices.length; i++) {
        const proxy = proxyServices[i];
        const proxyUrl = proxy.getUrl(targetUrl);
        
        try {
            console.log(`🌐 [${i+1}/${proxyServices.length}] ${proxy.name} 프록시 시도: ${proxyUrl}`);
            
            const response = await fetch(proxyUrl, {
                ...options,
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...options.headers
                },
                mode: 'cors'
            });
            
            console.log(`📡 ${proxy.name} 응답: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                console.log(`✅ ${proxy.name} 프록시로 FastAPI 서버 연결 성공!`);
                return response;
            } else {
                console.warn(`❌ ${proxy.name} 실패: ${response.status} ${response.statusText}`);
            }
            
        } catch (error) {
            console.warn(`❌ ${proxy.name} 에러: ${error.message}`);
            continue;
        }
    }
    
    // 모든 프록시 실패
    console.error('🚫 모든 프록시 서비스 실패 - FastAPI 서버 연결 불가');
    
    // HTTPS 서버 직접 연결 시도 (8443 포트)
    console.log('🔐 HTTPS FastAPI 서버 연결 시도 (8443 포트)...');
    try {
        let httpsUrl = targetUrl.replace('http://223.130.129.204:8080', 'https://223.130.129.204:8443');
        console.log(`🌐 HTTPS URL: ${httpsUrl}`);
        
        const httpsResponse = await fetch(httpsUrl, {
            ...options,
            method: 'GET',
            mode: 'cors'
        });
        
        if (httpsResponse.ok) {
            console.log('✅ HTTPS FastAPI 서버 직접 연결 성공!');
            return httpsResponse;
        }
    } catch (httpsError) {
        console.warn(`❌ HTTPS 연결 실패: ${httpsError.message}`);
    }
    
    // HTTP 서버 직접 연결 시도 (Mixed Content 경고 발생)
    console.log('🔄 HTTP FastAPI 서버 직접 연결 시도 (Mixed Content 경고 예상)...');
    try {
        const directResponse = await fetch(targetUrl, {
            ...options,
            method: 'GET',
            mode: 'cors'
        });
        
        if (directResponse.ok) {
            console.log('✅ HTTP FastAPI 서버 직접 연결 성공!');
            return directResponse;
        }
    } catch (directError) {
        console.warn(`❌ HTTP 직접 연결 실패: ${directError.message}`);
    }
    
    // 최종적으로 데모 모드로 전환
    console.log('🎭 최종 폴백: 데모 모드로 전환');
    showProxyFailureNotice();
    return await demoFetch(url);
}

// API 폴백 알림
function showAPIFallbackNotice() {
    const noticeDiv = document.createElement('div');
    noticeDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2196F3;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-family: monospace;
        font-size: 13px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    noticeDiv.innerHTML = '🎭 데모 모드로 실행 중';
    document.body.appendChild(noticeDiv);
    
    setTimeout(() => noticeDiv.remove(), 5000);
}

// SSL 인증서 안내 알림
function showSSLCertificateNotice() {
    const noticeDiv = document.createElement('div');
    noticeDiv.id = 'ssl-cert-notice';
    noticeDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #ffa502;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-family: monospace;
        font-size: 13px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        max-width: 650px;
        text-align: center;
    `;
    noticeDiv.innerHTML = `
        <h4 style="margin: 0 0 10px 0;">🔐 SSL 인증서 문제</h4>
        <p style="margin: 0 0 10px 0;">자체 서명 인증서로 인해 HTTPS 연결이 차단되었습니다.</p>
        <p style="margin: 0 0 10px 0; font-size: 12px;">
            <strong>해결방법:</strong> 
            <a href="https://223.130.129.204:8443" target="_blank" style="color: white; text-decoration: underline;">
                여기를 클릭</a>하여 인증서를 수동으로 허용하세요.
        </p>
        <p style="margin: 0; font-size: 11px;">프록시를 통한 HTTP 연결로 자동 전환됩니다.</p>
        <button onclick="this.parentElement.remove()" style="
            margin-top: 10px; 
            background: rgba(255,255,255,0.2); 
            border: 1px solid white; 
            color: white; 
            padding: 5px 10px; 
            border-radius: 4px; 
            cursor: pointer;
        ">닫기</button>
    `;
    
    // 기존 알림이 있으면 제거
    const existing = document.getElementById('ssl-cert-notice');
    if (existing) existing.remove();
    
    document.body.appendChild(noticeDiv);
    
    setTimeout(() => {
        if (noticeDiv.parentNode) noticeDiv.remove();
    }, 15000);
}

// 프록시 실패 알림
function showProxyFailureNotice() {
    const noticeDiv = document.createElement('div');
    noticeDiv.id = 'proxy-failure-notice';
    noticeDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #ff6b6b;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-family: monospace;
        font-size: 13px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        max-width: 600px;
        text-align: center;
    `;
    noticeDiv.innerHTML = `
        <h4 style="margin: 0 0 10px 0;">🚫 FastAPI 서버 연결 실패</h4>
        <p style="margin: 0 0 10px 0;">모든 프록시 서비스를 시도했지만 연결할 수 없습니다.</p>
        <p style="margin: 0; font-size: 12px;">
            <strong>해결방법:</strong> 
            1) FastAPI 서버에 CORS 설정 추가 
            2) 서버가 실행 중인지 확인 (223.130.129.204:8080)
        </p>
        <button onclick="this.parentElement.remove()" style="
            margin-top: 10px; 
            background: rgba(255,255,255,0.2); 
            border: 1px solid white; 
            color: white; 
            padding: 5px 10px; 
            border-radius: 4px; 
            cursor: pointer;
        ">닫기</button>
    `;
    
    // 기존 알림이 있으면 제거
    const existing = document.getElementById('proxy-failure-notice');
    if (existing) existing.remove();
    
    document.body.appendChild(noticeDiv);
    
    setTimeout(() => {
        if (noticeDiv.parentNode) noticeDiv.remove();
    }, 10000);
}

// 데모 모드 표시
function showDemoModeIndicator() {
    if (USE_DEMO_MODE) {
        const indicator = document.createElement('div');
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            color: white;
            padding: 8px 12px;
            border-radius: 20px;
            font-family: monospace;
            font-size: 12px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            animation: pulse 2s infinite;
        `;
        indicator.innerHTML = '🎭 DEMO';
        
        // CSS 애니메이션 추가
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.7; }
                100% { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(indicator);
    }
}

// Mixed Content 경고 메시지 표시
function showMixedContentWarning() {
    const warningDiv = document.createElement('div');
    warningDiv.id = 'mixed-content-warning';
    warningDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #ff6b6b;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 600px;
        text-align: center;
        font-family: monospace;
    `;
    
    warningDiv.innerHTML = `
        <h4 style="margin: 0 0 10px 0;">🔒 API 연결 차단됨</h4>
        <p style="margin: 0 0 10px 0;">HTTPS 사이트에서 HTTP API 호출이 차단되었습니다.</p>
        <p style="margin: 0; font-size: 0.9em;">
            <strong>해결 방법:</strong> 
            주소창 왼쪽 자물쇠 아이콘 → "사이트 설정" → "안전하지 않은 콘텐츠" → "허용"
        </p>
        <button onclick="this.parentElement.remove()" style="
            margin-top: 10px; 
            background: rgba(255,255,255,0.2); 
            border: 1px solid white; 
            color: white; 
            padding: 5px 10px; 
            border-radius: 4px; 
            cursor: pointer;
        ">닫기</button>
    `;
    
    document.body.appendChild(warningDiv);
}

// 서버 연결 테스트 함수
async function testServerConnection() {
    try {
        console.log('서버 연결 테스트 시작...');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60초 타임아웃
        
        const response = await fetch(`${API_BASE_URL}/`, {
            method: 'GET',
            mode: 'cors',
            signal: controller.signal,
            headers: {
                'X-API-Key': API_KEY,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        clearTimeout(timeoutId);
        console.log('서버 응답:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ 서버 연결 성공:', data);
        return true;
    } catch (error) {
        console.error('❌ 서버 연결 실패:', error.name, error.message);
        if (error.name === 'AbortError') {
            console.error('⏰ 연결 타임아웃 (60초)');
        }
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 데모 모드 표시
    showDemoModeIndicator();
    
    // GitHub Pages 환경에서 데모 모드 안내
    if (isGitHubPages && USE_DEMO_MODE) {
        showGitHubPagesNotice();
    }
    
    const tradeHistoryTableBody = document.querySelector('#trade-history-table tbody');
    const currentPositionsDiv = document.getElementById('current-positions');
    const positionUpdatedDiv = document.getElementById('position-updated');
    const tradesUpdatedDiv = document.getElementById('trades-updated');
    const serverTimeSpan = document.getElementById('server-time');

    // 시간 포맷 함수
    function formatTime() {
        return new Date().toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    // 서버 시간 업데이트
    function updateServerTime() {
        if (serverTimeSpan) {
            serverTimeSpan.textContent = new Date().toLocaleTimeString('ko-KR');
        }
    }

    // 1초마다 서버 시간 업데이트
    setInterval(updateServerTime, 1000);
    updateServerTime();

    // 현재 포지션 조회 (수정된 부분)
    async function fetchCurrentPositions() {
        try {
            const response = await unifiedFetch(`${API_BASE_URL}/positions`);
            const data = await response.json();
            updateCurrentPositions(data.accounts);
            positionUpdatedDiv.textContent = `마지막 업데이트: ${formatTime()}`;
            
        } catch (error) {
            console.error('포지션 조회 실패:', error);
            currentPositionsDiv.innerHTML = '<p>포지션 정보를 불러오는 중 오류가 발생했습니다.</p>';
        }
    }

    // 포지션 UI 업데이트 (개선된 버전)
    function updateCurrentPositions(accounts) {
        if (!accounts || accounts.length === 0) {
            currentPositionsDiv.innerHTML = '<div class="loading">등록된 계정이 없습니다.</div>';
            return;
        }

        let html = '<div class="position-grid">';
        let totalPositions = 0;
        let totalUnrealizedPnl = 0;
        
        accounts.forEach(account => {
            html += `<div class="account-card">
                <h3><i class="fas fa-university"></i> ${account.account_name.toUpperCase()} 계정</h3>`;
            
            if (!account.positions || account.positions.length === 0) {
                html += '<div class="no-position">현재 포지션 없음</div>';
            } else {
                totalPositions += account.positions.length;
                
                account.positions.forEach(position => {
                    totalUnrealizedPnl += position.unrealized_pnl || 0;
                    
                    const sideIcon = position.side === 'long' ? '<i class="fas fa-arrow-up"></i>' : '<i class="fas fa-arrow-down"></i>';
                    const sideColor = position.side === 'long' ? 'pnl-positive' : 'pnl-negative';
                    const pnlColor = position.unrealized_pnl >= 0 ? 'pnl-positive' : 'pnl-negative';
                    const pnlIcon = position.unrealized_pnl >= 0 ? '<i class="fas fa-dollar-sign"></i>' : '<i class="fas fa-minus-circle"></i>';
                    
                    html += `
                        <div class="position-item ${position.side}">
                            <div class="position-header">
                                <span class="position-side ${sideColor}">
                                    ${sideIcon} ${position.side.toUpperCase()}
                                </span>
                                <span class="position-leverage">${position.leverage}x</span>
                            </div>
                            <div class="position-details">
                                <div class="position-size"><i class="fas fa-chart-area"></i> 사이즈: ${position.size}</div>
                                <div class="position-price"><i class="fas fa-tag"></i> 평균가: $${position.avg_price}</div>
                                <div class="position-pnl ${pnlColor}">
                                    ${pnlIcon} 수익률: xx%
                                </div>
                            </div>
                        </div>
                    `;
                });
            }
            
            html += '</div>';
        });
        
        html += '</div>';
        
        // 전체 포지션 요약 정보 추가
        if (totalPositions > 0) {
            const summaryPnlColor = totalUnrealizedPnl >= 0 ? 'pnl-positive' : 'pnl-negative';
            const summaryIcon = totalUnrealizedPnl >= 0 ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-exclamation-circle"></i>';
            
            html += `
                <div style="margin-top: 20px; padding: 16px; background: var(--bg-secondary); border-radius: 12px; border-left: 4px solid var(--accent-primary);">
                    <h4 style="margin: 0 0 8px 0; color: var(--text-primary);"><i class="fas fa-calculator"></i> 포지션 요약</h4>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span><i class="fas fa-layer-group"></i> 총 포지션 수: <strong>${totalPositions}개</strong></span>
                        <span class="${summaryPnlColor}">${summaryIcon} 총 미실현 손익: $xx.xx</span>
                    </div>
                </div>
            `;
        }
        
        currentPositionsDiv.innerHTML = html;
    }

    // 거래 내역 조회
    async function fetchTradeHistory() {
        try {
            const response = await unifiedFetch(`${API_BASE_URL}/daily-report`);
            const data = await response.json();

            tradeHistoryTableBody.innerHTML = '';

            if (!data.accounts || data.accounts.length === 0) {
                tradeHistoryTableBody.innerHTML = '<tr><td colspan="8">거래 내역이 없습니다</td></tr>';
                return;
            }

            data.accounts.forEach(account => {
                // 계정별 구분 행 (금액 정보 제거)
                const separatorRow = document.createElement('tr');
                separatorRow.innerHTML = `
                    <td colspan="8" class="account-header-row">
                        <strong><i class="fas fa-university"></i> ${account.name.toUpperCase()} 계정</strong> | 
                        <i class="fas fa-hashtag"></i> 총 ${account.total_trades}건 거래 | 
                        <i class="fas fa-trophy"></i> 승률 ${account.win_rate}%
                    </td>
                `;
                tradeHistoryTableBody.appendChild(separatorRow);

                // 거래 내역이 없는 경우
                if (!account.detailed_trades || account.detailed_trades.length === 0) {
                    const noTradeRow = document.createElement('tr');
                    noTradeRow.innerHTML = '<td colspan="8" style="text-align: center; color: #6c757d; font-style: italic;">최근 24시간 거래 내역 없음</td>';
                    tradeHistoryTableBody.appendChild(noTradeRow);
                    return;
                }

                // 상세 거래 내역 (개선된 버전)
                account.detailed_trades.forEach((trade) => {
                    const row = document.createElement('tr');
                    const pnlClass = trade.pnl >= 0 ? 'pnl-positive' : 'pnl-negative';
                    const directionIcon = trade.direction === 'long' ? '<i class="fas fa-arrow-up"></i>' : '<i class="fas fa-arrow-down"></i>';
                    const resultIcon = trade.pnl >= 0 ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-times-circle"></i>';
                    
                    // 거래 시간을 더 읽기 쉽게 포맷
                    const timeDisplay = `${trade.open_time} → ${trade.close_time}`;

                    row.innerHTML = `
                        <td style="font-family: monospace; font-size: 0.9rem;">${timeDisplay}</td>
                        <td><strong style="color: var(--accent-primary);">${trade.symbol}</strong></td>
                        <td><span style="font-weight: 600;">${directionIcon} ${trade.direction.toUpperCase()}</span></td>
                        <td><span style="background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; font-weight: 600;">${trade.leverage}x</span></td>
                        <td class="${pnlClass}">
                            <div style="display: flex; align-items: center; justify-content: center; gap: 5px;">
                                <span>${resultIcon}</span>
                                <strong>${trade.pnl_ratio.toFixed(2)}%</strong>
                            </div>
                        </td>
                    `;
                    
                    // 호버 효과를 위한 이벤트 리스너
                    row.addEventListener('mouseenter', () => {
                        row.style.transform = 'scale(1.01)';
                        row.style.boxShadow = '0 4px 12px rgba(0, 212, 255, 0.1)';
                    });
                    
                    row.addEventListener('mouseleave', () => {
                        row.style.transform = 'scale(1)';
                        row.style.boxShadow = 'none';
                    });
                    
                    tradeHistoryTableBody.appendChild(row);
                });
            });

            tradesUpdatedDiv.textContent = `마지막 업데이트: ${formatTime()}`;

        } catch (error) {
            console.error('거래 내역 조회 실패:', error);
            if (tradeHistoryTableBody) {
                tradeHistoryTableBody.innerHTML = `<tr><td colspan="8">거래 내역 조회 실패: ${error.message}</td></tr>`;
            }
        }
    }

    // 초기 로딩
    fetchCurrentPositions();
    fetchTradeHistory();
    
    // 자동 새로고침 - 60초마다 갱신
    setInterval(fetchCurrentPositions, 60000);  // 포지션은 60초마다
    setInterval(fetchTradeHistory, 60000);      // 거래 내역은 60초마다
});
