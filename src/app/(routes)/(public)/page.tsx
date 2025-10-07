

import Home from "@/app/pages/public/Home";

export default async function home() {
    await new Promise((resolve) => setTimeout(resolve, 3000));
  return <Home />;
}
