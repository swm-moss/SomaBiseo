-- 후기 기능 동작 확인용 더미 데이터
-- 사용법:
--   docker compose up -d --build
--   docker compose exec -T postgres psql -U somabiseo -d somabiseo < backend/scripts/dev/seed_reviews.sql
--   (DB 이름/계정은 docker-compose.yml의 POSTGRES_USER / POSTGRES_DB 와 맞춰주세요)
--
-- 시나리오 (NOW 기준 상대 시각):
--   ev-001..ev-014 : 끝난 강의 14개 — /reviews 테이블에 노출, 후기 작성 가능
--                    (페이지네이션 확인: 페이지 1 = 10건, 페이지 2 = 4건)
--   ev-101         : 미래 강의 1개 — 끝난 특강 테이블에 노출되지 않음
--   reviews        : ev-002 1건 / ev-004 3건 / ev-010 2건 — 후기 수 컬럼 확인용
--                    ev-002에 '김연수' 1건이 들어 있어 같은 이름 재작성 시 409 검증 가능

begin;

-- 1) soma_events ----------------------------------------------------------
insert into soma_events
    (source_id, type, title, mentor_name, topic, description, location,
     start_at, end_at, status, source_url)
values
    ('ev-001', 'LECTURE',   '실전 LLM 서비스 아키텍처',           '김멘토', 'AI',
     'LLM 서비스 운영 노하우',         '판교 캠퍼스',
     now() - interval '1 day 2 hour',  now() - interval '1 day',     'CLOSED', 'https://dummy.invalid/ev-001'),

    ('ev-002', 'MENTORING', '백엔드 커리어 자유멘토링',           '박멘토', 'Career',
     '백엔드 진로/이직 자유 질의응답',  'Zoom',
     now() - interval '2 day 1 hour',  now() - interval '2 day',     'CLOSED', 'https://dummy.invalid/ev-002'),

    ('ev-003', 'LECTURE',   'Next.js 16 App Router 실전',         '이멘토', 'Frontend',
     'RSC / Server Actions 깊이 보기', '서울 캠퍼스',
     now() - interval '8 hour',         now() - interval '6 hour',   'CLOSED', 'https://dummy.invalid/ev-003'),

    ('ev-004', 'LECTURE',   'Kubernetes 운영 입문',               '최멘토', 'Infra',
     'EKS 기반 운영 사례',              '판교 캠퍼스',
     now() - interval '4 day 2 hour',   now() - interval '4 day',    'CLOSED', 'https://dummy.invalid/ev-004'),

    ('ev-005', 'MENTORING', '디자인 시스템 자유멘토링',           '한멘토', 'Design',
     '디자인 토큰/컴포넌트 구성 Q&A',   'Zoom',
     now() - interval '6 day 2 hour',   now() - interval '6 day',    'CLOSED', 'https://dummy.invalid/ev-005'),

    ('ev-006', 'LECTURE',   '제품 매니저 입문',                   '윤멘토', 'PM',
     'PM 역할과 도구',                  '서울 캠퍼스',
     now() - interval '7 day 1 hour',   now() - interval '7 day',    'CLOSED', 'https://dummy.invalid/ev-006'),

    ('ev-007', 'LECTURE',   'gRPC와 마이크로서비스 통신',         '정멘토', 'Backend',
     'gRPC 도입 사례와 운영',           '온라인',
     now() - interval '10 day 2 hour',  now() - interval '10 day',   'CLOSED', 'https://dummy.invalid/ev-007'),

    ('ev-008', 'MENTORING', 'iOS 인디 개발 자유멘토링',           NULL,     'Mobile',
     'SwiftUI/App Store 운영 Q&A',      'Zoom',
     now() - interval '14 day 1 hour',  now() - interval '14 day',   'CLOSED', 'https://dummy.invalid/ev-008'),

    ('ev-009', 'LECTURE',   '데이터 파이프라인 실전',             '강멘토', 'Data',
     'Airflow/Spark 운영',              '판교 캠퍼스',
     now() - interval '20 day 2 hour',  now() - interval '20 day',   'CLOSED', 'https://dummy.invalid/ev-009'),

    ('ev-010', 'LECTURE',   '시니어 개발자의 코드 리뷰 문화',     '조멘토', 'Engineering',
     '실제 PR 리뷰 시연 포함',          '서울 캠퍼스',
     now() - interval '30 day 2 hour',  now() - interval '30 day',   'CLOSED', 'https://dummy.invalid/ev-010'),

    ('ev-011', 'MENTORING', '창업 자유멘토링',                    '서멘토', 'Startup',
     '초기 PMF/투자 Q&A',               'Zoom',
     now() - interval '45 day 1 hour',  now() - interval '45 day',   'CLOSED', 'https://dummy.invalid/ev-011'),

    ('ev-012', 'LECTURE',   '보안 기초 - 토큰과 세션',            '오멘토', 'Security',
     'OAuth, JWT, 세션 비교',           '온라인',
     now() - interval '60 day 2 hour',  now() - interval '60 day',   'CLOSED', 'https://dummy.invalid/ev-012'),

    ('ev-013', 'LECTURE',   '게임 서버 부하 테스트 사례',         '임멘토', 'Backend',
     '대규모 동시접속 시뮬레이션',      '판교 캠퍼스',
     now() - interval '75 day 3 hour',  now() - interval '75 day',   'CLOSED', 'https://dummy.invalid/ev-013'),

    ('ev-014', 'MENTORING', 'AI 사이드 프로젝트 자유멘토링',      '백멘토', 'AI',
     '모델 선정과 배포 Q&A',            'Zoom',
     now() - interval '90 day 1 hour',  now() - interval '90 day',   'CLOSED', 'https://dummy.invalid/ev-014'),

    -- 미래 강의 (테이블에 노출되면 안 됨)
    ('ev-101', 'LECTURE',   '예정된 특강 - 미노출 검증',         '예멘토', 'Misc',
     '아직 끝나지 않은 강의',            'TBD',
     now() + interval '7 day',          now() + interval '7 day 2 hour', 'OPEN', 'https://dummy.invalid/ev-101')
on conflict (source_id) do nothing;

-- 2) reviews ---------------------------------------------------------------
insert into reviews
    (soma_event_id, author_name, content, author_ip, created_at, updated_at)
select se.id, x.author_name, x.content, x.author_ip, x.created_at, x.created_at
  from soma_events se
  join (values
    ('ev-002', '김연수',
     '자유멘토링이라 부담 없이 진로 얘기 나눌 수 있어서 좋았어요. 백엔드 커리어 처음 그리는 분께 추천합니다.',
     '127.0.0.1', now() - interval '1 day 12 hour'),

    ('ev-004', '한도윤',
     'EKS 실제 장애 사례를 들을 수 있어서 좋았습니다. 책에서 못 보는 운영 디테일이 진짜 도움 됐어요.',
     '127.0.0.1', now() - interval '3 day 4 hour'),
    ('ev-004', '최예진',
     '입문이라기엔 약간 빠른 호흡이었지만 따라가면 K8s 기본기를 빠르게 잡을 수 있는 강의입니다.',
     '127.0.0.1', now() - interval '3 day 2 hour'),
    ('ev-004', '윤하늘',
     '운영 관점의 모니터링/알람 구성 부분이 특히 좋았어요. 다음 시즌에 심화편이 있으면 또 듣고 싶습니다.',
     '127.0.0.1', now() - interval '2 day 20 hour'),

    ('ev-010', '박지훈',
     '한 달 전 강의지만 지금도 우리 팀 PR 리뷰 가이드의 베이스가 되고 있어요. 시연 예시가 진짜 좋았습니다.',
     '127.0.0.1', now() - interval '25 day'),
    ('ev-010', '강시우',
     '리뷰어 입장에서 어떻게 질문을 던지는지 보여주신 게 가장 기억에 남아요.',
     '127.0.0.1', now() - interval '20 day')
  ) as x(source_id, author_name, content, author_ip, created_at)
    on se.source_id = x.source_id
on conflict on constraint uk_review_event_author do nothing;

commit;

-- 검증 쿼리 예시
-- select source_id, type, title, end_at from soma_events order by end_at desc;
-- select se.source_id, count(r.id) as reviews
--   from soma_events se left join reviews r on r.soma_event_id = se.id
--  group by se.source_id order by se.source_id;
