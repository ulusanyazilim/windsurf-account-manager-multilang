import { computed } from 'vue';
import { useSettingsStore } from '@/store';
import { messages, type Locale } from '@/locales';

/**
 * i18n composable for accessing translations
 * @returns Object with current locale and translation function
 */
export function useI18n() {
    const settingsStore = useSettingsStore();

    // Current locale from settings
    const locale = computed<Locale>(() =>
        (settingsStore.settings.locale as Locale) || 'zh-CN'
    );

    // Translation messages for current locale
    const t = computed(() => messages[locale.value]);

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
