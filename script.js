// 암호화폐 자동매매 대시보드 JavaScript
// 환경별 API 서버 주소 설정
const API_CONFIGS = {
    development: 'http://127.0.0.1:8000',
    development2: 'http://localhost:8000',  // 로컬 테스트용
    production: 'http://223.130.129.204:8000',  // 다시 HTTP로 변경
    cors_proxy: 'https://cors-anywhere.herokuapp.com/http://223.130.129.204:8000',  // CORS 프록시
    allorigins_proxy: 'https://api.allorigins.win/raw?url=http://223.130.129.204:8000',  // 대안 프록시
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

if (isGitHubPages && isHTTPS) {
    // GitHub Pages HTTPS 환경 - CORS 프록시 사용
    console.log('🌐 GitHub Pages HTTPS 환경 - CORS 프록시 사용');
    API_BASE_URL = API_CONFIGS.cors_proxy;
    USE_PROXY = true;
} else if (isDevelopment) {
    API_BASE_URL = API_CONFIGS.development;
} else {
    API_BASE_URL = API_CONFIGS.production;
}

console.log(`현재 환경: ${isGitHubPages ? 'GitHub Pages (프록시)' : (isDevelopment ? 'Development' : 'Production')}`);
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
                        unrealized_pnl: 0.15,
                        unrealized_pnl_pct: 0.69
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
    
    // 실제 API 호출
    try {
        const response = await fetch(url, {
            ...options,
            mode: 'cors'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response;
    } catch (error) {
        console.error('실제 API 호출 실패, 데모 모드로 전환:', error.message);
        showAPIFallbackNotice();
        return await demoFetch(url);
    }
}

// CORS 프록시를 통한 fetch
async function proxyFetch(url, options = {}) {
    let finalUrl = url;
    
    if (USE_PROXY) {
        // CORS 프록시 URL 생성
        if (url.includes('/positions')) {
            finalUrl = `${API_CONFIGS.cors_proxy}/positions`;
        } else if (url.includes('/daily-report')) {
            finalUrl = `${API_CONFIGS.cors_proxy}/daily-report`;
        } else {
            finalUrl = `${API_CONFIGS.cors_proxy}/`;
        }
        
        console.log(`🌐 프록시를 통한 요청: ${finalUrl}`);
    }
    
    try {
        const response = await fetch(finalUrl, {
            ...options,
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response;
        
    } catch (error) {
        console.warn(`프록시 요청 실패: ${error.message}`);
        
        if (USE_PROXY) {
            console.log('🎭 데모 모드로 전환');
            showProxyFailureNotice();
            return await demoFetch(url);
        }
        
        throw error;
    }
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

// 프록시 실패 알림
function showProxyFailureNotice() {
    const noticeDiv = document.createElement('div');
    noticeDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff9800;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-family: monospace;
        font-size: 13px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    noticeDiv.innerHTML = '⚠️ 프록시 실패, 데모 모드로 전환';
    document.body.appendChild(noticeDiv);
    
    setTimeout(() => noticeDiv.remove(), 5000);
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

document.addEventListener('DOMContentLoaded', () => {
    // 데모 모드 표시
    showDemoModeIndicator();
    
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

    // 포지션 UI 업데이트 (금액 정보 모두 가리기)
    function updateCurrentPositions(accounts) {
        if (!accounts || accounts.length === 0) {
            currentPositionsDiv.innerHTML = '<p>등록된 계정이 없습니다.</p>';
            return;
        }

        let html = '<div class="position-grid">';
        
        accounts.forEach(account => {
            html += `<div class="account-card">
                <h3>🏦 ${account.account_name.toUpperCase()} 계정</h3>`;
            
            if (!account.positions || account.positions.length === 0) {
                html += '<p class="no-position">현재 포지션 없음</p>';
            } else {
                account.positions.forEach(position => {
                    const sideIcon = position.side === 'long' ? '📈' : '📉';
                    const sideColor = position.side === 'long' ? 'pnl-positive' : 'pnl-negative';
                    const pnlColor = position.unrealized_pnl >= 0 ? 'pnl-positive' : 'pnl-negative';
                    
                    html += `
                        <div class="position-item">
                            <div class="position-header">
                                <span class="position-side ${sideColor}">
                                    ${sideIcon} ${position.side.toUpperCase()}
                                </span>
                                <span class="position-leverage">${position.leverage}x</span>
                            </div>
                            <div class="position-details">
                                <div class="position-size">사이즈: ${position.size}</div>
                                <div class="position-pnl ${pnlColor}">
                                    수익률: ${position.unrealized_pnl_pct.toFixed(2)}%
                                </div>
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
    
    // 자동 새로고침 - 60초마다 갱신
    setInterval(fetchCurrentPositions, 60000);  // 포지션은 60초마다
    setInterval(fetchTradeHistory, 60000);      // 거래 내역은 60초마다
});