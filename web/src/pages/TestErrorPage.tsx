const TestErrorPage = () => {
  // 일부러 에러 발생
  throw new Error('테스트용 에러가 발생했습니다!');
  // return <div>이 코드는 실행되지 않습니다.</div>;
};

export default TestErrorPage;
