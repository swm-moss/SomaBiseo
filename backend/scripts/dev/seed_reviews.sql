-- 후기 기능 동작 확인용 더미 데이터
-- 사용법:
--   docker compose up -d --build
--   docker compose exec -T postgres psql -U somabiseo -d somabiseo < backend/scripts/dev/seed_reviews.sql
--   (DB 이름/계정은 docker-compose.yml의 POSTGRES_USER / POSTGRES_DB 와 맞춰주세요)
--
-- 시나리오 (NOW 기준 상대 시각):
--   ev-001  LECTURE     | 종료 1일 전     | 신청자 4명 | 리뷰 0건 | 작성 가능
--   ev-002  MENTORING   | 종료 2일 전     | 신청자 3명 | 리뷰 1건 | 작성 가능, 중복(409) 시나리오 가능
--   ev-003  LECTURE     | 종료 6시간 전   | 신청자 5명 | 리뷰 0건 | 작성 가능 (경계)
--   ev-004  LECTURE     | 종료 4일 전     | 신청자 4명 | 리뷰 3건 | 작성 불가(403), 열람만
--   ev-005  MENTORING   | 종료 1일 후     | 신청자 3명 | 리뷰 0건 | writable/대시보드 노출 X (미종료)
--   ev-006  LECTURE     | 종료 2일 전     | 신청자 0명 | 리뷰 0건 | writable 노출 X (명단 비어있음)

begin;

-- 1) soma_events ----------------------------------------------------------
insert into soma_events
    (source_id, type, title, mentor_name, topic, description, location,
     start_at, end_at, status, source_url)
values
    ('ev-001', 'LECTURE',   '실전 LLM 서비스 아키텍처', '김멘토', 'AI',
     '대규모 LLM 서비스 운영 노하우 공유', '판교 캠퍼스',
     now() - interval '1 day 2 hour', now() - interval '1 day', 'CLOSED', 'https://dummy.invalid/ev-001'),

    ('ev-002', 'MENTORING', '백엔드 커리어 자유멘토링', '박멘토', 'Career',
     '백엔드 진로/이직 자유 질의응답', 'Zoom',
     now() - interval '2 day 1 hour', now() - interval '2 day', 'CLOSED', 'https://dummy.invalid/ev-002'),

    ('ev-003', 'LECTURE',   'Next.js 16 App Router 실전', '이멘토', 'Frontend',
     'RSC / Server Actions / Cache 동작 깊이 보기', '서울 캠퍼스',
     now() - interval '8 hour', now() - interval '6 hour', 'CLOSED', 'https://dummy.invalid/ev-003'),

    ('ev-004', 'LECTURE',   'Kubernetes 운영 입문', '최멘토', 'Infra',
     'EKS 기반 운영 사례', '판교 캠퍼스',
     now() - interval '4 day 2 hour', now() - interval '4 day', 'CLOSED', 'https://dummy.invalid/ev-004'),

    ('ev-005', 'MENTORING', '디자인 시스템 자유멘토링', '한멘토', 'Design',
     '디자인 토큰/컴포넌트 구성 Q&A', 'Zoom',
     now() + interval '23 hour', now() + interval '1 day', 'OPEN', 'https://dummy.invalid/ev-005'),

    ('ev-006', 'LECTURE',   '제품 매니저 입문', '윤멘토', 'PM',
     'PM 역할과 도구', '서울 캠퍼스',
     now() - interval '2 day 1 hour', now() - interval '2 day', 'CLOSED', 'https://dummy.invalid/ev-006')
on conflict (source_id) do nothing;

-- 2) event_applicants ------------------------------------------------------
-- soma_events.id는 bigserial이므로, source_id로 join해서 안전하게 insert
insert into event_applicants
    (soma_event_id, applicant_no, trainee_name, applied_at, status, snapshot_at)
select se.id, x.applicant_no, x.trainee_name, x.applied_at, 'APPROVED', now()
  from soma_events se
  join (values
    -- ev-001 (4명)
    ('ev-001', 'A-001-1', '김연수', now() - interval '5 day'),
    ('ev-001', 'A-001-2', '박지훈', now() - interval '5 day'),
    ('ev-001', 'A-001-3', '이서연', now() - interval '4 day'),
    ('ev-001', 'A-001-4', '정민준', now() - interval '4 day'),
    -- ev-002 (3명)
    ('ev-002', 'A-002-1', '김연수', now() - interval '6 day'),
    ('ev-002', 'A-002-2', '최예진', now() - interval '6 day'),
    ('ev-002', 'A-002-3', '한도윤', now() - interval '5 day'),
    -- ev-003 (5명)
    ('ev-003', 'A-003-1', '박지훈', now() - interval '3 day'),
    ('ev-003', 'A-003-2', '이서연', now() - interval '3 day'),
    ('ev-003', 'A-003-3', '윤하늘', now() - interval '2 day'),
    ('ev-003', 'A-003-4', '정민준', now() - interval '2 day'),
    ('ev-003', 'A-003-5', '강시우', now() - interval '1 day'),
    -- ev-004 (4명)
    ('ev-004', 'A-004-1', '김연수', now() - interval '8 day'),
    ('ev-004', 'A-004-2', '한도윤', now() - interval '8 day'),
    ('ev-004', 'A-004-3', '최예진', now() - interval '7 day'),
    ('ev-004', 'A-004-4', '윤하늘', now() - interval '7 day'),
    -- ev-005 (3명, 미래 이벤트)
    ('ev-005', 'A-005-1', '김연수', now() - interval '1 day'),
    ('ev-005', 'A-005-2', '강시우', now() - interval '1 day'),
    ('ev-005', 'A-005-3', '박지훈', now() - interval '12 hour')
    -- ev-006 (의도적으로 신청자 없음)
  ) as x(source_id, applicant_no, trainee_name, applied_at)
    on se.source_id = x.source_id
on conflict on constraint uk_event_applicant do nothing;

-- 3) reviews ---------------------------------------------------------------
insert into reviews
    (soma_event_id, author_name, content, author_ip, created_at, updated_at)
select se.id, x.author_name, x.content, x.author_ip, x.created_at, x.created_at
  from soma_events se
  join (values
    -- ev-002에 김연수가 이미 작성 → 같은 이름으로 재시도 시 409 시나리오 검증용
    ('ev-002', '김연수',
     '자유멘토링이라 부담 없이 진로 얘기 나눌 수 있어서 좋았어요. 백엔드 커리어 처음 그리는 분께 추천합니다.',
     '127.0.0.1', now() - interval '1 day 12 hour'),
    -- ev-004 (4일 전 종료) 열람 시나리오용 3건
    ('ev-004', '한도윤',
     'EKS 실제 장애 사례를 들을 수 있어서 좋았습니다. 책에서 못 보는 운영 디테일이 진짜 도움 됐어요.',
     '127.0.0.1', now() - interval '3 day 4 hour'),
    ('ev-004', '최예진',
     '입문이라기엔 약간 빠른 호흡이었지만, 따라가면 K8s 기본기를 빠르게 잡을 수 있는 강의입니다.',
     '127.0.0.1', now() - interval '3 day 2 hour'),
    ('ev-004', '윤하늘',
     '운영 관점의 모니터링/알람 구성 부분이 특히 좋았어요. 다음 시즌에 심화편이 있으면 또 듣고 싶습니다.',
     '127.0.0.1', now() - interval '2 day 20 hour')
  ) as x(source_id, author_name, content, author_ip, created_at)
    on se.source_id = x.source_id
on conflict on constraint uk_review_event_author do nothing;

commit;

-- 검증 쿼리 예시
-- select source_id, type, title, end_at from soma_events order by end_at;
-- select se.source_id, count(ea.id) as applicants
--   from soma_events se left join event_applicants ea on ea.soma_event_id = se.id
--  group by se.source_id order by se.source_id;
-- select se.source_id, count(r.id) as reviews
--   from soma_events se left join reviews r on r.soma_event_id = se.id
--  group by se.source_id order by se.source_id;
