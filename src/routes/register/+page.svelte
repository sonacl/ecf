<script>
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";
    import { appState } from "$lib/stores/index.svelte.js";
    import { api } from "$lib/utils/api.js";
    import AuthForm from "$lib/components/auth/AuthForm.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import { onMount } from "svelte";
    let email = $state("");
    let username = $state("");
    let displayName = $state("");
    let password = $state("");
    let password2 = $state("");
    let errorMsg = $state("");
    let loading = $state(false);
    onMount(() => {
        if (browser && appState.token) goto("/app");
    });
    const passwordsMatch = $derived(
        password === password2 || password2.length === 0,
    );
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
            id: "username",
            label: "Username",
            inputType: "text",
            value: username,
            onInput: (v) => (username = v),
            placeholder: "cooluser123",
            required: true,
            autocomplete: "username",
        },
        {
            id: "display-name",
            label: "Display Name",
            inputType: "text",
            value: displayName,
            onInput: (v) => (displayName = v),
            placeholder: "How others see you (optional)",
            required: false,
        },
        {
            id: "password",
            label: "Password",
            inputType: "password",
            value: password,
            onInput: (v) => (password = v),
            placeholder: "••••••••",
            required: true,
            autocomplete: "new-password",
        },
        {
            id: "password2",
            label: "Confirm Password",
            inputType: "password",
            value: password2,
            onInput: (v) => (password2 = v),
            placeholder: "••••••••",
            required: true,
            autocomplete: "new-password",
        },
    ]);
    async function handleRegister(e) {
        e.preventDefault();
        errorMsg = "";
        if (
            !email.trim() ||
            !username.trim() ||
            !password.trim() ||
            !password2.trim()
        ) {
            errorMsg = "Please fill in all required fields.";
            return;
        }
        if (password !== password2) {
            errorMsg = "Passwords do not match.";
            return;
        }
        if (password.length < 6) {
            errorMsg = "Password must be at least 6 characters.";
            return;
        }
        loading = true;
        try {
            const res = await api.auth.register({
                email,
                username,
                display_name: displayName || username,
                password,
                password2,
            });
            if (res?.success) {
                const loginRes = await api.auth.login(email, password);
                goto(loginRes?.token ? "/app" : "/login");
            } else {
                errorMsg = res?.error || "Registration failed.";
            }
        } catch (err) {
            errorMsg = err.message || "Something went wrong.";
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
            title="Create an account"
            subtitle="Join the community and start chatting."
            {fields}
            submitLabel="Register"
            error={errorMsg}
            {loading}
            onSubmit={handleRegister}
            footerText="Already have an account?"
            footerLinkText="Log In"
            footerLinkHref="/login"
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
        max-width: 480px;
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
