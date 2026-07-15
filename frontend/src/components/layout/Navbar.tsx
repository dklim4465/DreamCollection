import { Link } from "react-router-dom";
import { useAuthStore } from "@/auth/store/authStore";
import Logo from "./Logo";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <header className="bg-surface sticky top-0 z-50 shadow-glow">
      <nav className="flex justify-between items-center w-full px-margin-desktop py-unit max-w-container-max mx-auto h-20">
        {/* 로고 */}
        <Link to="/">
          <Logo />
        </Link>

        {/* 검색 + 아이콘 + 마이페이지 */}
        <div className="flex items-center gap-stack-md">
          <SearchBar />

          <button className="material-symbols-outlined text-on-surface-variant hover:opacity-80">
            notifications
          </button>

          {isAuthenticated ? (
            <Link to="/profile" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.nickname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-primary text-lg">
                    person
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-label-md font-bold text-on-surface">
                마이페이지
              </span>
            </Link>
          ) : (
            <Link to="/login" className="btn-ghost text-sm py-2 px-4">
              로그인
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
