import {NextRouter, useRouter} from "next/router";
import axios from "../../lib/axios";
import Head from "next/head";

export default function ProductDetail() {
    const {query}: NextRouter = useRouter();
    const {id}: { id: string } = query as { id: string };

    return (
        <>
            <Head>
                <title>Detail</title>
            </Head>
            <section>
                <button className="button-small" onClick={async () => {
                    const res = await axios.get(`/product/${id}`);
                    console.log(res);
                }}>
                    fetch {id}
                </button>
            </section>
        </>
    )
}
