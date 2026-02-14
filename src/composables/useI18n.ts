import { computed, type ComputedRef } from 'vue';
import { useSettingsStore } from '@/store';
import { messages, type Locale } from '@/locales';
import type { LocaleMessages } from '@/types/locales';

/**
 * i18n composable for accessing translations
 * @returns Object with current locale and translation function
 */
export function useI18n(): {
    locale: ComputedRef<Locale>;
    t: ComputedRef<LocaleMessages>;
    setLocale: (newLocale: Locale) => Promise<void>;
} {
    const settingsStore = useSettingsStore();

    // Current locale from settings
    const locale = computed<Locale>(() =>
        (settingsStore.settings.locale as Locale) || 'zh-CN'
    );

    // Translation messages for current locale
    const t: ComputedRef<LocaleMessages> = computed(() => messages[locale.value] as LocaleMessages);

    // Function to change locale
    async function setLocale(newLocale: Locale) {
        await settingsStore.updateSettings({
            ...settingsStore.settings,
            locale: newLocale
        });
    }

    return {
        locale,
        t,
        setLocale
    };
}
