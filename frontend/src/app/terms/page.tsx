import type { Metadata } from "next";

import { LegalList, LegalPage, LegalSection } from "@/views/legal/ui";

export const metadata: Metadata = {
  title: "이용약관",
  description: "SomaBiseo 서비스 이용 조건과 책임 범위",
  alternates: {
    canonical: "/terms",
  },
};

const updatedAt = "시행일 2026.05.23";

export default function TermsPage() {
  return (
    <LegalPage
      description="SomaBiseo를 사용할 때 적용되는 기본 조건과 서비스 책임 범위를 정리합니다."
      title="이용약관"
      updatedAt={updatedAt}
    >
      <LegalSection title="서비스 성격">
        <p>
          SomaBiseo는 소프트웨어마에스트로 연수생의 공지, 특강, 멘토링, 캘린더 관리를 돕는 비공식 일정 비서
          서비스입니다. 공식 소프트웨어마에스트로 서비스, 공식 앱, 공식 신청 시스템이 아닙니다.
        </p>
      </LegalSection>

      <LegalSection title="이용 대상">
        <LegalList
          items={[
            "SomaBiseo는 소프트웨어마에스트로 활동자 또는 관련 정보를 확인할 정당한 필요가 있는 사용자를 대상으로 합니다.",
            "첫 이용 시 Google 로그인과 초대 코드 인증이 필요할 수 있습니다.",
            "타인의 Google 계정이나 초대 코드를 사용해서는 안 됩니다.",
          ]}
        />
      </LegalSection>

      <LegalSection title="제공 기능">
        <LegalList
          items={[
            "공지사항, 멘토특강, 자유멘토링 목록과 상세 정보 정리",
            "관심사 기반 특강/멘토링 추천",
            "Google Calendar 일정 조회를 통한 충돌 확인",
            "사용자가 선택한 소마 일정의 Google Calendar 추가",
            "종료된 특강/멘토링에 대한 후기 작성과 조회",
          ]}
        />
      </LegalSection>

      <LegalSection title="금지 행위">
        <LegalList
          items={[
            "공식 서비스로 오인하게 만드는 사용",
            "초대 코드, 계정, 세션을 제3자에게 양도하거나 공유하는 행위",
            "서비스 또는 SOMA 포털에 과도한 자동 요청을 발생시키는 행위",
            "특강 신청, 취소, 후기 작성 등을 자동화하거나 매크로 방식으로 남용하는 행위",
            "타인의 개인정보, 캘린더 정보, 후기 내용을 무단 수집하거나 공개하는 행위",
            "서비스 장애, 보안 침해, 데이터 변조를 유발하는 행위",
          ]}
        />
      </LegalSection>

      <LegalSection title="정보 정확성">
        <p>
          SomaBiseo는 사용자의 편의를 위해 SOMA 관련 정보를 정리하지만, 공식 원본과 시간 차이 또는 파싱 오류가
          발생할 수 있습니다. 중요한 공지, 신청 마감, 장소 변경, 필수 참석 여부는 공식 채널에서 다시 확인해야 합니다.
        </p>
      </LegalSection>

      <LegalSection title="캘린더 기능">
        <p>
          사용자가 Google Calendar 권한을 승인하면 SomaBiseo는 일정 충돌 확인과 일정 추가 기능을 제공합니다.
          캘린더에 추가된 일정의 정확성, 알림 설정, 중복 여부는 사용자가 최종 확인해야 합니다.
        </p>
      </LegalSection>

      <LegalSection title="후기">
        <LegalList
          items={[
            "후기는 사용자가 직접 작성한 내용이어야 합니다.",
            "비방, 모욕, 개인정보 노출, 허위 정보, 광고성 내용은 제한될 수 있습니다.",
            "본인이 작성한 후기는 수정하거나 삭제할 수 있습니다.",
          ]}
        />
      </LegalSection>

      <LegalSection title="서비스 변경">
        <p>
          SomaBiseo는 기능, 화면, 데이터 동기화 방식, 제공 범위를 변경하거나 일시 중단할 수 있습니다. 보안 문제,
          공식 서비스 정책 변경, 외부 API 제한이 발생하면 일부 기능이 제한될 수 있습니다.
        </p>
      </LegalSection>

      <LegalSection title="책임 제한">
        <p>
          SomaBiseo는 고의 또는 중대한 과실이 없는 한 정보 누락, 일정 착오, 외부 서비스 장애, Google API 제한,
          공식 사이트 구조 변경으로 인한 손해에 대해 책임을 지지 않습니다.
        </p>
      </LegalSection>

      <LegalSection title="문의">
        <p>
          약관 관련 문의는{" "}
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
