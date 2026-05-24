import type { Metadata } from "next";

import { LegalList, LegalPage, LegalSection } from "@/views/legal/ui";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "SomaBiseo 개인정보 수집, 이용, 보관, 삭제 기준",
  alternates: {
    canonical: "/privacy",
  },
};

const updatedAt = "시행일 2026.05.23";

export default function PrivacyPage() {
  return (
    <LegalPage
      description="SomaBiseo가 서비스 제공을 위해 어떤 정보를 처리하는지, Google API 데이터가 어떻게 사용되는지 설명합니다."
      title="개인정보처리방침"
      updatedAt={updatedAt}
    >
      <LegalSection title="처리하는 정보">
        <LegalList
          items={[
            "Google 로그인 정보: Google 계정 식별자, 이메일 주소, 이름, 프로필 이미지 URL",
            "인증 세션 정보: 서비스 세션 ID, Google access token, refresh token, 토큰 만료 시각, 초대 코드 인증 여부",
            "Google Calendar 정보: 사용자가 권한을 승인한 캘린더의 일정 제목, 시작/종료 시각, 위치, 설명, 일정 ID",
            "서비스 사용 정보: 관심사 설정, 공지 읽음/북마크, 관심 일정, 캘린더 추가 여부, 후기 작성 내용",
            "보안 및 운영 정보: 요청 IP, 요청 시각, 오류 로그, 데이터 동기화 로그",
          ]}
        />
      </LegalSection>

      <LegalSection title="처리 목적">
        <LegalList
          items={[
            "Google 계정 기반 로그인과 소마 활동자 확인",
            "공지, 멘토특강, 자유멘토링 목록과 상세 정보 제공",
            "사용자 관심사에 맞는 특강/멘토링 추천",
            "Google Calendar 일정 조회를 통한 충돌 확인",
            "사용자가 선택한 소마 일정을 Google Calendar에 추가",
            "후기 작성, 수정, 삭제와 본인 작성 여부 확인",
            "장애 대응, 보안 점검, 서비스 품질 개선",
          ]}
        />
      </LegalSection>

      <LegalSection title="Google API 데이터 사용">
        <p>
          SomaBiseo는 Google OAuth를 통해 사용자가 승인한 범위 안에서만 Google 사용자 데이터에 접근합니다.
          현재 서비스는 로그인과 캘린더 기능 제공을 위해 이메일, 프로필 정보, Google Calendar 이벤트 권한을 사용합니다.
        </p>
        <LegalList
          items={[
            "Google Calendar 데이터는 일정 충돌 확인과 사용자가 요청한 일정 추가에만 사용합니다.",
            "Google Calendar 데이터와 Google OAuth 토큰은 광고, 판매, 제3자 마케팅 목적으로 사용하지 않습니다.",
            "Google API로부터 받은 정보의 사용은 Google API Services User Data Policy와 Limited Use 요구사항을 준수합니다.",
          ]}
        />
      </LegalSection>

      <LegalSection title="보관 기간">
        <LegalList
          items={[
            "회원 정보와 초대 코드 인증 기록은 서비스 이용 기간 동안 보관합니다.",
            "Google OAuth 세션은 설정된 세션 만료 시각까지 보관하며, 로그아웃 시 해당 세션을 삭제합니다.",
            "Google Calendar 일정 추가 이력은 중복 등록 방지와 사용자 확인을 위해 서비스 이용 기간 동안 보관할 수 있습니다.",
            "후기는 사용자가 삭제하거나 서비스 운영상 보관 필요가 없어질 때까지 보관합니다.",
            "운영 로그와 동기화 로그는 장애 대응과 보안 확인에 필요한 기간 동안 보관합니다.",
          ]}
        />
      </LegalSection>

      <LegalSection title="제3자 제공">
        <p>
          SomaBiseo는 사용자의 개인정보를 판매하지 않습니다. 다만 사용자가 Google 로그인 또는 Google Calendar
          기능을 사용할 때 Google OAuth와 Google Calendar API가 동작하며, 서비스 운영을 위해 Vercel, Railway,
          PostgreSQL 등 배포와 데이터 저장 인프라가 사용될 수 있습니다.
        </p>
      </LegalSection>

      <LegalSection title="보호 조치">
        <LegalList
          items={[
            "서비스와 브라우저 사이 통신은 HTTPS 환경에서 운영합니다.",
            "서버 저장소와 운영 환경 접근 권한은 서비스 운영에 필요한 인원과 시스템으로 제한합니다.",
            "SOMA 포털 비밀번호는 사용자에게 요청하거나 저장하지 않습니다.",
            "초대 코드 입력은 반복 실패 시 일시 제한하여 무차별 대입을 줄입니다.",
          ]}
        />
      </LegalSection>

      <LegalSection title="이용자 권리">
        <p>
          사용자는 로그아웃으로 현재 인증 세션을 종료할 수 있고, Google 계정 보안 설정에서 SomaBiseo의 Google
          접근 권한을 철회할 수 있습니다. 개인정보 열람, 정정, 삭제, 처리 정지를 요청하려면 아래 문의 채널로
          연락해 주세요.
        </p>
      </LegalSection>

      <LegalSection title="문의">
        <p>
          개인정보 관련 문의와 삭제 요청은{" "}
          <a
            className="font-bold text-primary underline-offset-4 hover:underline"
            href="https://github.com/swm-moss/SomaBiseo/issues"
            rel="noreferrer"
            target="_blank"
          >
            SomaBiseo GitHub Issues
          </a>
          로 접수할 수 있습니다.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
