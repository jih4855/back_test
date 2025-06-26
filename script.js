// 암호화폐 자동매매 대시보드 JavaScript
// 환경별 API 서버 주소 설정
const API_CONFIGS = {
    development: 'http://127.0.0.1:8000',
    development2: 'http://localhost:8000',  // 로컬 테스트용
    production: 'https://223.130.129.204:8443',  // HTTPS 서버 (포트 8443)
    production_fallback: 'http://223.130.129.204:8000',  // HTTP 폴백용
    production_https: 'https://223.130.129.204:8443',  // HTTPS 시도용
    cors_proxy: 'https://cors-anywhere.herokuapp.com/http://223.130.129.204:8000',  // CORS 프록시
    jsonp_fallback: 'http://223.130.129.204:8000'  // JSONP 폴백용
};

// 현재 환경 감지 - GitHub Pages 감지 로직 개선
const isGitHubPages = window.location.hostname.includes('github.io');
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname.includes('localhost');
const isHTTPS = window.location.protocol === 'https:';

// 환경별 API URL 결정 - HTTPS 우선 시도
let API_BASE_URL;
let USE_FALLBACK_METHOD = false;

if (isGitHubPages && isHTTPS) {
    // GitHub Pages HTTPS 환경 - HTTPS API 서버 사용
    console.log('🔒 GitHub Pages HTTPS 환경 - HTTPS API 서버 연결 시도');
    API_BASE_URL = API_CONFIGS.production;  // HTTPS 서버로 연결
    USE_FALLBACK_METHOD = true;  // 실패 시 HTTP 폴백
} else if (isDevelopment) {
    API_BASE_URL = API_CONFIGS.development;
} else {
    API_BASE_URL = API_CONFIGS.production;
}

console.log(`현재 환경: ${isGitHubPages ? 'GitHub Pages' : (isDevelopment ? 'Development' : 'Production')}`);
console.log(`프로토콜: ${window.location.protocol}`);
console.log(`API 서버: ${API_BASE_URL}`);
console.log(`폴백 방법 사용: ${USE_FALLBACK_METHOD}`);

// HTTPS 연결 실패 시 HTTP 폴백 함수
async function fetchWithFallback(url, options = {}) {
    try {
        // 첫 번째 시도: HTTPS
        console.log(`🔒 HTTPS 연결 시도: ${url}`);
        const response = await fetch(url, {
            ...options,
            mode: 'cors'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        console.log('✅ HTTPS 연결 성공');
        return response;
        
    } catch (error) {
        console.warn(`HTTPS 연결 실패: ${error.message}`);
        
        if (USE_FALLBACK_METHOD && isHTTPS) {
            console.log('🔄 HTTP 폴백 연결 시도...');
            
            try {
                // HTTP 폴백 URL 생성
                const fallbackUrl = url.replace(API_CONFIGS.production, API_CONFIGS.production_fallback);
                console.log(`📡 HTTP 폴백: ${fallbackUrl}`);
                
                const fallbackResponse = await fetch(fallbackUrl, {
                    ...options,
                    mode: 'cors'
                });
                
                if (!fallbackResponse.ok) {
                    throw new Error(`HTTP ${fallbackResponse.status}: ${fallbackResponse.statusText}`);
                }
                
                console.log('✅ HTTP 폴백 연결 성공');
                showHttpFallbackNotice();
                return fallbackResponse;
                
            } catch (fallbackError) {
                console.error('❌ 모든 연결 방법 실패:', fallbackError.message);
                showConnectionError();
                throw fallbackError;
            }
        }
        
        throw error;
    }
}

// HTTP 폴백 사용 알림
function showHttpFallbackNotice() {
    const noticeDiv = document.createElement('div');
    noticeDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff9800;
        color: white;
        padding: 10px 15px;
        border-radius: 6px;
        font-family: monospace;
        font-size: 12px;
        z-index: 10000;
    `;
    noticeDiv.innerHTML = '⚠️ HTTPS 실패, HTTP 연결 사용 중';
    document.body.appendChild(noticeDiv);
    
    setTimeout(() => noticeDiv.remove(), 5000);
}

// 연결 오류 표시
function showConnectionError() {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #f44336;
        color: white;
        padding: 20px;
        border-radius: 8px;
        font-family: monospace;
        text-align: center;
        z-index: 10000;
    `;
    errorDiv.innerHTML = `
        <h3>🚫 서버 연결 실패</h3>
        <p>API 서버에 연결할 수 없습니다.</p>
        <button onclick="window.location.reload()" style="
            background: rgba(255,255,255,0.2);
            border: 1px solid white;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
        ">새로고침</button>
    `;
    document.body.appendChild(errorDiv);
}

// Mixed Content 경고 메시지 표시 (더 간단하게)
function showSimpleMixedContentGuide() {
    // 기존 경고가 있으면 제거
    const existing = document.getElementById('mixed-content-guide');
    if (existing) existing.remove();
    
    const guideDiv = document.createElement('div');
    guideDiv.id = 'mixed-content-guide';
    guideDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2196F3;
        color: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 350px;
        font-family: monospace;
        font-size: 14px;
    `;
    
    guideDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
                <h4 style="margin: 0 0 8px 0;">🔧 API 연결 설정</h4>
                <p style="margin: 0 0 8px 0; font-size: 13px;">
                    주소창 🔒 → 사이트 설정 → 안전하지 않은 콘텐츠 → <strong>허용</strong>
                </p>
                <p style="margin: 0; font-size: 12px; opacity: 0.9;">
                    이 사이트에서만 적용됩니다.
                </p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: rgba(255,255,255,0.2); 
                border: none; 
                color: white; 
                padding: 4px 8px; 
                border-radius: 4px; 
                cursor: pointer;
                font-size: 16px;
                margin-left: 10px;
            ">×</button>
        </div>
    `;
    
    document.body.appendChild(guideDiv);
    
    // 30초 후 자동 사라짐
    setTimeout(() => {
        if (document.getElementById('mixed-content-guide')) {
            guideDiv.remove();
        }
    }, 30000);
}

// Mixed Content 문제 해결을 위한 fetch 래퍼 함수
async function safeFetch(url, options = {}) {
    try {
        // 첫 번째 시도: 일반 fetch
        const response = await fetch(url, {
            ...options,
            mode: 'cors'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response;
    } catch (error) {
        console.warn(`직접 fetch 실패: ${error.message}`);
        
        if (USE_FALLBACK_METHOD && isHTTPS) {
            console.log('🔄 대안 방법 시도 중...');
            
            try {
                // 방법 1: 서버에 직접 요청 (브라우저 설정 필요)
                console.log('💡 브라우저에서 "안전하지 않은 콘텐츠 허용" 설정을 활성화해주세요.');
                console.log('Chrome: 주소창 자물쇠 → 사이트 설정 → 안전하지 않은 콘텐츠 → 허용');
                console.log('Firefox: 주소창 방패 아이콘 → 보호 기능 사용 안함');
                
                // 사용자에게 Mixed Content 해결 안내
                showMixedContentWarning();
                
                throw new Error('Mixed Content 차단 - 브라우저 설정 필요');
                
            } catch (fallbackError) {
                console.error('모든 연결 방법 실패:', fallbackError.message);
                throw fallbackError;
            }
        }
        
        throw error;
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
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 5초 타임아웃
        
        const response = await fetch(`${API_BASE_URL}/`, {
            method: 'GET',
            mode: 'cors',
            signal: controller.signal
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
    const tradeHistoryTableBody = document.querySelector('#trade-history-table tbody');
    const currentPositionsDiv = document.getElementById('current-positions');
    const positionUpdatedDiv = document.getElementById('position-updated');
    const tradesUpdatedDiv = document.getElementById('trades-updated');

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

    // 현재 포지션 조회
    async function fetchCurrentPositions() {
        try {
            const response = await fetch(`${API_BASE_URL}/positions`, {
                mode: 'cors'
            });
            if (!response.ok) throw new Error('포지션 조회 실패');
            const data = await response.json();
            updateCurrentPositions(data.accounts);
            positionUpdatedDiv.textContent = `마지막 업데이트: ${formatTime()}`;
            
            // 첫 성공 시 가이드 제거
            const guide = document.getElementById('mixed-content-guide');
            if (guide) guide.remove();
            
        } catch (error) {
            console.error('포지션 조회 실패:', error);
            currentPositionsDiv.innerHTML = '<p>포지션 정보를 불러오는 중 오류가 발생했습니다.</p>';
            
            // Mixed Content 오류 시 가이드 표시
            if (error.message.includes('Failed to fetch') && isHTTPS) {
                showSimpleMixedContentGuide();
            }
        }
    }

    // 포지션 UI 업데이트 (금액 정보 모두 가리기)
    function updateCurrentPositions(accounts) {
        if (!accounts || accounts.length === 0) {
            currentPositionsDiv.innerHTML = '<p>등록된 계정이 없습니다.</p>';
            return;
        }

        let html = '<div class="position-grid">';
        
        accounts.forEach(account => {
            html += `<div class="account-card">`;
            html += `<h3>${account.account_name.toUpperCase()} 계정</h3>`;
            
            if (!account.positions || account.positions.length === 0) {
                html += '<div class="position-item no-position">현재 포지션 없음</div>';
            } else {
                account.positions.forEach(pos => {
                    const pnlClass = pos.unrealized_pnl >= 0 ? 'pnl-positive' : 'pnl-negative';
                    const positionClass = pos.side === 'long' ? '' : 'short';
                    const sideIcon = pos.side === 'long' ? '📈' : '📉';
                    
                    html += `
                        <div class="position-item ${positionClass}">
                            <strong>${sideIcon} SOL-USDT (${pos.side.toUpperCase()})</strong><br>
                            <div style="margin-top: 10px;">
                                <div><strong>레버리지:</strong> ${pos.leverage}x</div>
                                <div><strong>수익률:</strong> <span class="${pnlClass}">${pos.unrealized_pnl_pct}%</span></div>
                            </div>
                        </div>
                    `;
                });
            }
            
            html += '</div>';
        });
        
        html += '</div>';
        currentPositionsDiv.innerHTML = html;
    }

    // 거래 내역 조회
    async function fetchTradeHistory() {
        try {
            const response = await fetch(`${API_BASE_URL}/daily-report`, {
                mode: 'cors'
            });
            if (!response.ok) throw new Error('거래 내역 조회 실패');
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
                        <strong>🏦 ${account.name.toUpperCase()} 계정</strong> | 
                        총 ${account.total_trades}건 거래 | 
                        승률 ${account.win_rate}%
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

                // 상세 거래 내역 (금액 정보 제거)
                account.detailed_trades.forEach(trade => {
                    const row = document.createElement('tr');
                    const pnlClass = trade.pnl >= 0 ? 'pnl-positive' : 'pnl-negative';
                    const directionIcon = trade.direction === 'long' ? '📈' : '📉';

                    row.innerHTML = `
                        <td>${trade.open_time} ~ ${trade.close_time}</td>
                        <td><strong>${trade.symbol}</strong></td>
                        <td>${directionIcon} ${trade.direction.toUpperCase()}</td>
                        <td>${trade.leverage}x</td>
                        <td class="${pnlClass}"><strong>${trade.pnl_ratio.toFixed(2)}%</strong></td>
                    `;
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
    
    // 자동 새로고침
    setInterval(fetchCurrentPositions, 5000);  // 포지션은 5초마다
    setInterval(fetchTradeHistory, 30000);     // 거래 내역은 30초마다
});
