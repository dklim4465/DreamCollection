import type { ApiResponse, User } from "@/types";

export interface LoginReq {
  email: string;
  password: string;
}
export interface RegisterReq {
  email: string;
  password: string;
  name: string;
  nickname: string;
  phone: string;
  phoneVerificationCode?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvc?: string;
  travelStyle: string;
}
export interface AuthRes {
  accessToken: string;
  user: User;
}

// ────────────────────────────────────────────────────────────
// 프론트엔드 전용 더미 인증 (백엔드 미사용)
// localStorage를 가짜 회원 DB로 사용해 회원가입/로그인을 흉내냅니다.
// 실제 백엔드가 준비되면 이 파일만 axios 기반 구현으로 교체하면 됩니다.
// ────────────────────────────────────────────────────────────

const USERS_KEY = "dream_collection_users";
const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

interface StoredUser extends User {
  password: string;
}

function readUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// 테스트용 계정 자동 생성 (이메일: test@dreamcollection.com / 비밀번호: test1234)
function seedTestAccount() {
  const users = readUsers();
  if (users.some((u) => u.email === "test@dreamcollection.com")) return;
  users.push({
    id: 1,
    email: "test@dreamcollection.com",
    password: "test1234",
    name: "테스트",
    nickname: "테스트유저",
    phone: "010-0000-0000",
    travelStyle: "RELAXED",
    createdAt: new Date().toISOString(),
  });
  writeUsers(users);
}
seedTestAccount();

function toAuthRes(stored: StoredUser): ApiResponse<AuthRes> {
  const { password: _password, ...user } = stored;
  return {
    success: true,
    message: "OK",
    data: { accessToken: `mock-token-${stored.id}`, user },
  };
}

export const authApi = {
  register: async (d: RegisterReq): Promise<{ data: ApiResponse<AuthRes> }> => {
    await delay();
    const users = readUsers();
    if (users.some((u) => u.email === d.email)) {
      throw new Error("이미 가입된 이메일입니다.");
    }
    const newUser: StoredUser = {
      id: Date.now(),
      email: d.email,
      name: d.name,
      nickname: d.nickname,
      phone: d.phone,
      travelStyle: d.travelStyle as User["travelStyle"],
      createdAt: new Date().toISOString(),
      password: d.password,
    };
    users.push(newUser);
    writeUsers(users);
    return { data: toAuthRes(newUser) };
  },

  login: async (d: LoginReq): Promise<{ data: ApiResponse<AuthRes> }> => {
    await delay();
    const users = readUsers();
    const found = users.find(
      (u) => u.email === d.email && u.password === d.password,
    );
    if (!found) throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    return { data: toAuthRes(found) };
  },

  getMe: async (): Promise<{ data: ApiResponse<User | null> }> => {
    await delay(100);
    return { data: { success: true, message: "OK", data: null } };
  },

  logout: async () => {
    await delay(100);
  },

  sendPhoneCode: async (_phone: string) => {
    await delay(300);
    return { data: { success: true } };
  },
  verifyPhoneCode: async (_phone: string, _code: string) => {
    await delay(300);
    return { data: { success: true } };
  },

  kakaoLogin: async (): Promise<{ data: ApiResponse<AuthRes> }> => {
    await delay(300);
    const demoUser: StoredUser = {
      id: 0,
      email: "kakao-demo@dreamcollection.com",
      name: "카카오 사용자",
      nickname: "카카오여행자",
      phone: "",
      travelStyle: "RELAXED",
      createdAt: new Date().toISOString(),
      password: "",
    };
    return { data: toAuthRes(demoUser) };
  },
};
