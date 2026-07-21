import { useState, type ReactNode } from "react";
import type { TravelerRequest } from "@/payment/api/paymentOrderApi";
import { emptyTraveler, isTravelerValid } from "@/payment/utils/travelerForm";

interface Prefill {
  fullName?: string;
  phone?: string;
}

interface Props {
  mode: "add" | "edit";
  initial?: TravelerRequest;
  /** 추가 시 첫 여행자 여부 (대표 자동 + 이름/연락처 프리필) */
  isFirstTraveler: boolean;
  showRepresentativeToggle: boolean;
  prefill?: Prefill;
  onClose: () => void;
  onSubmit: (traveler: TravelerRequest) => void;
}

export default function TravelerFormModal({
  mode,
  initial,
  isFirstTraveler,
  showRepresentativeToggle,
  prefill,
  onClose,
  onSubmit,
}: Props) {
  const [draft, setDraft] = useState<TravelerRequest>(() =>
    buildInitialDraft({ mode, initial, isFirstTraveler, prefill }),
  );

  const title = mode === "edit" ? "여행자 정보 수정" : "여행자 정보 추가";
  const submitLabel = mode === "edit" ? "저장" : "추가하기";
  const canSave = isTravelerValid({
    ...draft,
    representative: !showRepresentativeToggle || draft.representative,
  });

  const patch = (partial: Partial<TravelerRequest>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="traveler-modal-title"
      onClick={onClose}
    >
      <div
        className="card-base bg-surface-container-lowest w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-outline-variant/40 px-5 py-4">
          <h3 id="traveler-modal-title" className="text-headline-sm font-bold">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-container"
            aria-label="닫기"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-4 px-5 py-5">
          <Field label="여권상 영문 이름">
            <input
              className="input-base"
              placeholder="예) HONG GIL DONG"
              value={draft.fullName}
              onChange={(e) => patch({ fullName: e.target.value })}
              autoComplete="off"
            />
          </Field>

          <Field label="생년월일">
            <input
              className="input-base"
              type="date"
              value={draft.birthDate}
              onChange={(e) => patch({ birthDate: e.target.value })}
            />
          </Field>

          <fieldset>
            <legend className="mb-2 text-label-md text-on-surface-variant">
              성별
            </legend>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-body-md">
                <input
                  type="radio"
                  name="traveler-gender"
                  checked={draft.gender === "M"}
                  onChange={() => patch({ gender: "M" })}
                />
                남
              </label>
              <label className="flex items-center gap-2 text-body-md">
                <input
                  type="radio"
                  name="traveler-gender"
                  checked={draft.gender === "F"}
                  onChange={() => patch({ gender: "F" })}
                />
                여
              </label>
            </div>
          </fieldset>

          <Field label="여권번호">
            <input
              className="input-base"
              placeholder="여권번호"
              value={draft.passportNumber}
              onChange={(e) => patch({ passportNumber: e.target.value })}
            />
          </Field>

          <Field label="여권 만료일">
            <input
              className="input-base"
              type="date"
              value={draft.passportExpiry}
              onChange={(e) => patch({ passportExpiry: e.target.value })}
            />
          </Field>

          <Field label="국적">
            <input
              className="input-base"
              placeholder="예) KR / Republic of Korea"
              value={draft.nationality ?? ""}
              onChange={(e) => patch({ nationality: e.target.value })}
            />
          </Field>

          <Field label="연락처">
            <input
              className="input-base"
              placeholder="01012345678"
              value={draft.phone ?? ""}
              onChange={(e) => patch({ phone: e.target.value })}
            />
            {(!showRepresentativeToggle || draft.representative) && (
              <p className="mt-1 text-label-sm text-on-surface-variant">
                대표 여행자 연락처는 필수입니다.
              </p>
            )}
          </Field>

          {showRepresentativeToggle && (
            <label className="flex items-center gap-2 text-body-md">
              <input
                type="checkbox"
                checked={draft.representative}
                onChange={(e) => patch({ representative: e.target.checked })}
              />
              대표 여행자
            </label>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-outline-variant/40 px-5 py-4">
          <button type="button" className="btn-ghost" onClick={onClose}>
            취소
          </button>
          <button
            type="button"
            className="btn-primary disabled:opacity-50"
            disabled={!canSave}
            onClick={() => {
              const representative =
                !showRepresentativeToggle || draft.representative;
              const normalized: TravelerRequest = {
                ...draft,
                fullName: draft.fullName.trim(),
                passportNumber: draft.passportNumber.trim(),
                nationality: draft.nationality?.trim() || undefined,
                phone: draft.phone?.trim() || undefined,
                representative,
              };
              if (!isTravelerValid(normalized)) return;
              onSubmit(normalized);
            }}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-label-md text-on-surface-variant">{label}</span>
      {children}
    </label>
  );
}

function buildInitialDraft(params: {
  mode: "add" | "edit";
  initial?: TravelerRequest;
  isFirstTraveler: boolean;
  prefill?: Prefill;
}): TravelerRequest {
  if (params.mode === "edit" && params.initial) {
    return { ...params.initial, phone: params.initial.phone ?? "" };
  }
  const draft = emptyTraveler(params.isFirstTraveler);
  if (params.isFirstTraveler && params.prefill) {
    return {
      ...draft,
      fullName: params.prefill.fullName?.trim() || "",
      phone: params.prefill.phone?.trim() || "",
    };
  }
  return draft;
}
