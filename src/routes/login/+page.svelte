<script>
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";
    import { appState } from "$lib/stores/index.svelte.js";
    import { api } from "$lib/utils/api.js";
    import AuthForm from "$lib/components/auth/AuthForm.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import { onMount } from "svelte";
    let email = $state("");
    let password = $state("");
    let errorMsg = $state("");
    let loading = $state(false);
    onMount(() => {
        if (browser && appState.token) goto("/app");
    });
    const fields = $derived([
        {
            id: "email",
            label: "Email",
            inputType: "email",
            value: email,
            onInput: (v) => (email = v),
            placeholder: "you@example.com",
            required: true,
            autocomplete: "email",
        },
        {
            id: "password",
            label: "Password",
            inputType: "password",
            value: password,
            onInput: (v) => (password = v),
            placeholder: "••••••••",
            required: true,
            autocomplete: "current-password",
        },
    ]);
    async function handleLogin(e) {
        e.preventDefault();
        errorMsg = "";
        if (!email.trim() || !password.trim()) {
            errorMsg = "Please fill in all fields.";
            return;
        }
        loading = true;
        try {
            const res = await api.auth.login(email, password);
            if (res?.token) {
                goto("/app");
            } else {
                errorMsg = res?.error || "Invalid email or password.";
            }
        } catch (err) {
            errorMsg = err.message || "Something went wrong. Try again.";
        } finally {
            loading = false;
        }
    }
</script>
<div class="auth-page">
    <div class="auth-container">
        <a href="/" class="back-link">
            <Icon name="lucide:arrow-left" size="16" />
            Back to home
        </a>
        <AuthForm
            title="Welcome back!"
            subtitle="We're so excited to see you again."
            {fields}
            submitLabel="Log In"
            error={errorMsg}
            {loading}
            onSubmit={handleLogin}
            footerText="Don't have an account?"
            footerLinkText="Register"
            footerLinkHref="/register"
        />
    </div>
</div>
<style>
    .auth-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--bg-primary);
        padding: 24px;
    }
    .auth-container {
        width: 100%;
        max-width: 420px;
    }
    .back-link {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--text-muted);
        font-size: 0.85rem;
        text-decoration: none;
        margin-bottom: 24px;
        transition: color 0.15s;
    }
    .back-link:hover {
        color: var(--text-primary);
        text-decoration: none;
    }
</style>
