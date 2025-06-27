# Claude 작업 메모

## 프로젝트 개요
- 암호화폐 자동매매 대시보드 (OKX API 연동)
- 다크모드 기반 실시간 모니터링 시스템

## 사용자 선호사항
- **이모지 사용 선호**: 사용자는 이모지/이모티콘을 좋아함 
- **대화 스타일**: 간접적이고 맥락적인 대화를 많이 함 - 직접적인 요청보다는 힌트나 암시로 의도를 전달
- **반응 패턴**: 빠른 변경보다는 사용자의 진짜 의도를 파악하고 대응해야 함

## 기술적 특징
- API 서버: 223.130.129.204:8000 (변경 금지)
- 60초 자동 새로고침
- CORS 프록시 지원
- 데모 모드 폴백

## 개발 방향
- 다크모드 유지 필수
- 현재 정보 유지하면서 기능 추가
- 이모지 활용한 직관적 UI 선호
- 현대적이고 깔끔한 디자인

## 주의사항
- 사용자의 간접적 표현 뒤에 숨은 진짜 의도 파악 중요
- 성급한 변경보다는 맥락 이해 우선

## FastAPI 서버 CORS 설정 필요
GitHub Pages HTTPS에서 HTTP API 서버 연결을 위해 FastAPI 서버에 아래 코드 추가 필요:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS 설정 - GitHub Pages에서 접근 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://jih4855.github.io",  # GitHub Pages 도메인
        "http://localhost:3000",      # 로컬 개발용
        "*"                           # 임시로 모든 도메인 허용
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# 기존 API 라우트들...
```

## 프록시 서비스 우선순위
1. AllOrigins (안정성 높음)
2. CorsProxy.io 
3. ThingProxy
4. CorsAnywhere (제한적)