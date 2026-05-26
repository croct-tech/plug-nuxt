<template>
    <h1>Croct Nuxt SDK Playground</h1>
    <nav>
        <h2>SSR</h2>
        <ul>
            <li>
                useContent:
                <NuxtLink to="/ssr/use-content/valid">valid</NuxtLink> |
                <NuxtLink to="/ssr/use-content/invalid">invalid</NuxtLink>
            </li>
            <li>
                useEvaluation:
                <NuxtLink to="/ssr/use-evaluation/valid">valid</NuxtLink> |
                <NuxtLink to="/ssr/use-evaluation/invalid">invalid</NuxtLink>
            </li>
            <li>
                SlotContent:
                <NuxtLink to="/ssr/slot-content/valid">valid</NuxtLink> |
                <NuxtLink to="/ssr/slot-content/invalid">invalid</NuxtLink> |
                <NuxtLink to="/ssr/slot-content/fallback">fallback</NuxtLink>
            </li>
            <li>
                Personalization:
                <NuxtLink to="/ssr/personalization/valid">valid</NuxtLink> |
                <NuxtLink to="/ssr/personalization/invalid">invalid</NuxtLink>
            </li>
        </ul>

        <h2>CSR</h2>
        <ul>
            <li>
                useContent:
                <NuxtLink to="/csr/use-content/valid">valid</NuxtLink> |
                <NuxtLink to="/csr/use-content/invalid">invalid</NuxtLink> |
                <NuxtLink to="/csr/use-content/fallback">fallback</NuxtLink>
            </li>
            <li>
                useEvaluation:
                <NuxtLink to="/csr/use-evaluation/valid">valid</NuxtLink> |
                <NuxtLink to="/csr/use-evaluation/invalid">invalid</NuxtLink> |
                <NuxtLink to="/csr/use-evaluation/fallback">fallback</NuxtLink>
            </li>
            <li>
                SlotContent:
                <NuxtLink to="/csr/slot-content/valid">valid</NuxtLink> |
                <NuxtLink to="/csr/slot-content/fallback">fallback</NuxtLink>
            </li>
            <li>
                Personalization:
                <NuxtLink to="/csr/personalization/valid">valid</NuxtLink> |
                <NuxtLink to="/csr/personalization/fallback">fallback</NuxtLink>
            </li>
        </ul>

        <h2>Server</h2>
        <ul>
            <li><NuxtLink to="/server/evaluate">evaluate</NuxtLink></li>
            <li><NuxtLink to="/server/content">fetchContent</NuxtLink></li>
        </ul>

        <h2>Other</h2>
        <ul>
            <li><NuxtLink to="/use-croct">useCroct</NuxtLink></li>
        </ul>
    </nav>
</template>
