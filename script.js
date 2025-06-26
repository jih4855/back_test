// 암호화폐 자동매매 대시보드 JavaScript
// 환경별 API 서버 주소 설정 (같은 서버에서 동작)
const API_CONFIGS = {
    development: 'http://127.0.0.1:8000',
    development2: 'http://localhost:8000',  // 로컬 테스트용
    production: 'http://223.130.129.204:8000'  // 네이버 서버 (같은 서버)

};

// 현재 환경 감지
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname.includes('localhost') ||
                     window.location.hostname === 'localhost:8000' ||
                     window.location.hostname === 'localhost:8000'; 

// 같은 서버에서 동작하는 경우 상대 경로 사용 가능
const API_BASE_URL = isDevelopment ? API_CONFIGS.development : API_CONFIGS.production;


console.log(`현재 환경: ${isDevelopment ? 'Development' : 'Production'}`);
console.log(`API 서버: ${API_BASE_URL || 'Same Server (Relative Path)'}`);

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
            const response = await fetch(`${API_BASE_URL}/positions`);
            if (!response.ok) throw new Error('포지션 조회 실패');
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
            const response = await fetch(`${API_BASE_URL}/daily-report`);
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