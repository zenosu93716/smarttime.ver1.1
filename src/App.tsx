import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 14c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">서비스가 종료되었습니다</h1>
          <p className="text-gray-600">
            스마트 직원 스케줄러 서비스를 이용해 주셔서 감사합니다.<br />
            현재 프로젝트가 종료되어 더 이상 서비스를 이용하실 수 없습니다.
          </p>
        </div>
        <div className="pt-4 border-t border-gray-100 text-sm text-gray-500">
          문의사항이 있으시면 관리자에게 연락해 주세요.
        </div>
      </div>
    </div>
  );
}

export default App;
