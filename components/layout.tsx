import Header from "./header";
import Footer from "./footer";
import {ReactNode} from "react";

export default function Layout({children}: { children: ReactNode }) {
    return (
        <div className={'min-h-screen'}>
            <Header/>
            <div>
                {children}
            </div>
            <Footer/>
        </div>
    );
}
