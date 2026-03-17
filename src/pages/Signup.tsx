import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const signupSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다.'),
  part: z.enum(['1파트', '2파트', '3파트', '4파트', '5파트', '팀장', '부팀장', '기타']),
  position: z.enum(['팀장', '부팀장', '파트장', '상담사', '팀원']),
});

type SignupForm = z.infer<typeof signupSchema>;

export const Signup = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      navigate('/');
    }
  }, [profile, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: user?.displayName || '',
      part: '1파트',
      position: '팀원'
    }
  });

  const onSubmit = async (data: SignupForm) => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Determine role based on position/part
      const isAdmin = ['팀장', '부팀장', '파트장', '상담사'].includes(data.position) || 
                      user.email === 'youngbosu2@gmail.com';
      
      const role = isAdmin ? 'admin' : 'user';

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        name: data.name,
        role,
        part: data.part,
        position: data.position,
        profilePic: user.photoURL || '',
        createdAt: serverTimestamp()
      });

      navigate('/');
    } catch (err: any) {
      setError(err.message || '회원가입에 실패했습니다.');
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          추가 정보 입력
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          원활한 스케줄 관리를 위해 소속을 선택해주세요.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                이름
              </label>
              <div className="mt-1">
                <input
                  {...register('name')}
                  type="text"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="part" className="block text-sm font-medium text-gray-700">
                소속 파트
              </label>
              <div className="mt-1">
                <select
                  {...register('part')}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="1파트">1파트</option>
                  <option value="2파트">2파트</option>
                  <option value="3파트">3파트</option>
                  <option value="4파트">4파트</option>
                  <option value="5파트">5파트</option>
                  <option value="팀장">팀장</option>
                  <option value="부팀장">부팀장</option>
                  <option value="기타">기타</option>
                </select>
                {errors.part && <p className="mt-1 text-sm text-red-600">{errors.part.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                직책
              </label>
              <div className="mt-1">
                <select
                  {...register('position')}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="팀원">팀원</option>
                  <option value="상담사">상담사</option>
                  <option value="파트장">파트장</option>
                  <option value="부팀장">부팀장</option>
                  <option value="팀장">팀장</option>
                </select>
                {errors.position && <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? '저장 중...' : '시작하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
