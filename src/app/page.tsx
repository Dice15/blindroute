import styles from "@/app/page.module.css";
import ChatAdot from "./_components/ChatAdot";


export default async function AppRoot() {
  // Const
  //const isAuth = (await getServerSession(authOptions)) !== null;


  // Render
  return (
    <div className={styles.wrapper}>
      <ChatAdot />
    </div >
  );
  // return (
  //   <div className={styles.wrapper}>
  //     {isAuth && <Link href={"./passenger/reserve-bus"} className={styles.linkOps}><button className={styles.btnOps}>시작하기</button></Link>}
  //     <AuthButton
  //       isAuth={isAuth}
  //       authButtons={{
  //         signInButton: <button className={`${styles.btnOps} ${styles.btnAuth}`}>로그인</button>,
  //         signOutButton: <button className={`${styles.btnOps} ${styles.btnAuth}`}>로그아웃</button>
  //       }}
  //     />
  //   </div>
  // )
}