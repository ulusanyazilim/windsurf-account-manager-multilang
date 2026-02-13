<template>
  <el-dialog
    v-model="uiStore.showSettingsDialog"
    :title="t.settings.title"
    width="700px"
  >
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 基础设置标签页 -->
      <el-tab-pane :label="t.settings.basicSettings" name="basic">
        <el-form :model="settings" label-width="140px">
          <el-form-item :label="t.settings.autoRefreshToken">
            <el-switch v-model="settings.auto_refresh_token" />
            <div style="margin-top: 5px; color: #909399; font-size: 12px;">
              {{ t.settings.autoRefreshTokenDesc }}
            </div>
          </el-form-item>
          
          <el-form-item :label="t.settings.unlimitedConcurrent" v-if="settings.auto_refresh_token">
            <el-switch v-model="settings.unlimitedConcurrentRefresh" />
            <div style="margin-top: 5px; color: #909399; font-size: 12px;">
              {{ t.settings.unlimitedConcurrentDesc }}
            </div>
          </el-form-item>
          
          <!-- 座位数选项 - simple 版本已禁用
          <el-form-item label="座位数选项">
            <el-input
              v-model="seatCountOptionsInput"
              placeholder="例如: 18, 19, 20"
              style="width: 200px;"
              @blur="parseSeatCountOptions"
            />
            <div style="margin-top: 5px; color: #909399; font-size: 12px;">
              积分重置时轮番使用的座位数，用逗号分隔（如：18, 19, 20）
            </div>
          </el-form-item>
          -->
          
          <el-form-item :label="t.settings.retryTimes">
            <el-input-number
              v-model="settings.retry_times"
              :min="1"
              :max="5"
              :step="1"
            />
            <div style="margin-top: 5px; color: #909399; font-size: 12px;">
              {{ t.settings.retryTimesDesc }}
            </div>
          </el-form-item>
          
          <el-form-item :label="t.settings.concurrentLimit">
            <el-input-number
              v-model="settings.concurrent_limit"
              :min="1"
              :max="10"
              :step="1"
              :disabled="settings.unlimitedConcurrentRefresh"
            />
            <div style="margin-top: 5px; color: #909399; font-size: 12px;">
              {{ settings.unlimitedConcurrentRefresh ? t.settings.concurrentLimitDescUnlimited : t.settings.concurrentLimitDescDefault }}
            </div>
          </el-form-item>
          
          <el-form-item :label="t.settings.theme">
            <el-radio-group v-model="settings.theme">
              <el-radio-button label="light">{{ t.settings.light }}</el-radio-button>
              <el-radio-button label="dark">{{ t.settings.dark }}</el-radio-button>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item :label="t.settings.showSeatsResult">
            <el-switch 
              v-model="settings.show_seats_result_dialog"
              :active-text="t.accounts.active"
              :inactive-text="t.common.close"
            />
            <div style="margin-top: 5px; color: #909399; font-size: 12px;">
              {{ t.settings.showSeatsResultDesc }}
            </div>
          </el-form-item>
          
          <el-form-item :label="t.settings.privacyMode">
            <el-switch 
              v-model="settings.privacyMode"
              :active-text="t.accounts.active"
              :inactive-text="t.common.close"
            />
            <div style="margin-top: 5px; color: #909399; font-size: 12px;">
              {{ t.settings.privacyModeDesc }}
            </div>
          </el-form-item>
          
          <el-divider content-position="left">{{ t.settings.networkRepair }}</el-divider>
          
          <el-form-item :label="t.settings.lightweightApi">
            <el-switch 
              v-model="settings.useLightweightApi"
              :active-text="t.accounts.active"
              :inactive-text="t.common.close"
            />
            <div style="margin-top: 5px; color: #909399; font-size: 12px;">
              {{ t.settings.lightweightApiDesc }}
            </div>
          </el-form-item>
          
          <el-form-item :label="t.settings.proxyEnabled">
            <el-switch 
              v-model="settings.proxyEnabled"
              :active-text="t.accounts.active"
              :inactive-text="t.common.close"
            />
            <div style="margin-top: 5px; color: #909399; font-size: 12px;">
              {{ t.settings.proxyEnabledDesc }}
            </div>
          </el-form-item>
          
          <el-form-item :label="t.settings.proxyUrl" v-if="settings.proxyEnabled">
            <el-input
              v-model="settings.proxyUrl"
              placeholder="http://127.0.0.1:7890"
              style="width: 280px;"
              clearable
            >
              <template #prefix>
                <el-icon><Connection /></el-icon>
              </template>
            </el-input>
            <div style="margin-top: 5px; color: #909399; font-size: 12px;">
              {{ t.settings.proxyUrlDesc }}
            </div>
          </el-form-item>
          
          <el-form-item :label="t.settings.resetHttpClient">
            <el-button 
              type="warning" 
              @click="handleResetHttpClient"
              :loading="resettingHttp"
            >
              {{ t.settings.resetHttpClientBtn }}
            </el-button>
            <div style="margin-top: 5px; color: #909399; font-size: 12px;">
              {{ t.settings.resetHttpClientDesc }}
            </div>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      
      <!-- 支付设置标签页 -->
      <el-tab-pane :label="t.settings.paymentSettings" name="payment">
        <el-form :model="settings" label-width="140px">
          <el-form-item :label="t.settings.autoOpenPayment">
            <el-switch 
              v-model="settings.autoOpenPaymentLinkInWebview"
              :active-text="t.accounts.active"
              :inactive-text="t.common.close"
            />
            <div style="margin-top: 5px; color: #909399; font-size: 12px;">
              {{ t.settings.autoOpenPaymentDesc }}
            </div>
          </el-form-item>
          
          <el-divider content-position="left">{{ t.settings.externalBrowser }}</el-divider>
          
          <el-form-item :label="t.settings.autoOpenBrowser">
            <el-switch 
              v-model="settings.autoOpenBrowser"
              :active-text="t.accounts.active"
              :inactive-text="t.common.close"
            />
            <div style="margin-top: 5px; color: #909399; font-size: 12px;">
              {{ t.settings.autoOpenBrowserDesc }}
            </div>
          </el-form-item>
          
          <el-form-item :label="t.settings.browserMode">
            <el-radio-group v-model="settings.browserMode">
              <el-radio-button label="incognito">{{ t.settings.incognito }}</el-radio-button>
              <el-radio-button label="normal">{{ t.settings.normal }}</el-radio-button>
            </el-radio-group>
            <div style="margin-top: 5px; color: #909399; font-size: 12px;">
              {{ t.settings.browserModeDesc }}
            </div>
          </el-form-item>
          
          <el-divider content-position="left">{{ t.settings.autoFillSetup }}</el-divider>
          
          <el-form-item :label="t.settings.autoFillForm">
            <el-switch 
              v-model="settings.autoFillPaymentForm"
              :active-text="t.accounts.active"
              :inactive-text="t.common.close"
            />
            <div style="margin-top: 5px; color: #909399; font-size: 12px;">
              {{ t.settings.autoFillFormDesc }}
            </div>
          </el-form-item>
          
          <el-form-item :label="t.settings.showVirtualCard">
            <el-switch 
              v-model="settings.showVirtualCardInfo"
              :active-text="t.accounts.active"
              :inactive-text="t.common.close"
            />
            <div style="margin-top: 5px; color: #909399; font-size: 12px;">
              {{ t.settings.showVirtualCardDesc }}
            </div>
          </el-form-item>
          
          <el-form-item :label="t.settings.autoSubmitForm">
            <el-switch 
              v-model="settings.autoSubmitPaymentForm"
              :active-text="t.accounts.active"
              :inactive-text="t.common.close"
              :disabled="!settings.autoFillPaymentForm"
            />
            <div style="margin-top: 5px; color: #909399; font-size: 12px;">
              {{ t.settings.autoSubmitFormDesc }}
            </div>
          </el-form-item>
          
          <el-form-item :label="t.settings.paymentDelay">
            <el-input-number
              v-model="settings.paymentPageDelay"
              :min="1"
              :max="10"
              :step="1"
              :disabled="!settings.autoFillPaymentForm"
            />
            <div style="margin-top: 5px; color: #909399; font-size: 12px;">
              {{ t.settings.paymentDelayDesc }}
            </div>
          </el-form-item>
          
          <el-form-item :label="t.settings.customBin">
            <el-input
              v-model="settings.customCardBin"
              :placeholder="t.settings.customBinPlaceholder"
              maxlength="12"
              @input="validateCardBin"
            >
              <template #append>
                <el-button @click="resetCardBin">{{ t.settings.resetDefault }}</el-button>
              </template>
            </el-input>
            <div style="margin-top: 5px; color: #909399; font-size: 12px;">
              {{ t.settings.customBinDesc }}
            </div>
          </el-form-item>
          
          <el-form-item :label="t.settings.binRange">
            <el-input
              v-model="settings.customCardBinRange"
              :placeholder="t.settings.binRangePlaceholder"
              @input="validateCardBinRange"
            >
              <template #append>
                <el-button @click="clearCardBinRange">{{ t.settings.clear }}</el-button>
              </template>
            </el-input>
            <div style="margin-top: 5px; color: #909399; font-size: 12px;">
              {{ t.settings.binRangeDesc }}
            </div>
          </el-form-item>
          
          <el-form-item :label="t.settings.bindRetryTimes">
            <el-input-number
              v-model="settings.cardBindRetryTimes"
              :min="0"
              :max="20"
              :step="1"
              controls-position="right"
            />
            <div style="margin-top: 5px; color: #909399; font-size: 12px;">
              {{ t.settings.bindRetryTimesDesc }}
            </div>
          </el-form-item>
          
          <el-divider content-position="left">{{ t.settings.binPool }}</el-divider>
          
          <el-form-item :label="t.settings.testMode">
            <div style="display: flex; align-items: center; gap: 10px;">
              <el-switch v-model="settings.testModeEnabled" />
              <el-button 
                size="small" 
                type="warning" 
                @click="resetTestModeProgress"
                :disabled="!testModeProgress"
              >
                {{ t.settings.resetProgress }}
              </el-button>
            </div>
            <div style="margin-top: 5px; color: #909399; font-size: 12px;">
              {{ t.settings.testModeDesc }}
              （{{ successBinCount }}）
              <span v-if="testModeProgress" style="color: #67C23A;">
                <br/>{{ t.settings.currentProgress.replace('{progress}', testModeProgress) }}
              </span>
            </div>
          </el-form-item>
          
          <el-form-item :label="t.settings.useLocalPool">
            <el-switch v-model="settings.useLocalSuccessBins" :disabled="successBinCount === 0" />
            <div style="margin-top: 5px; color: #909399; font-size: 12px;">
              {{ t.settings.useLocalPoolDesc }}
            </div>
          </el-form-item>
          
          <el-form-item :label="t.settings.poolManagement">
            <el-button-group>
              <el-button size="small" @click="viewSuccessBins" :disabled="successBinCount === 0">
                {{ t.settings.viewPool }}
              </el-button>
              <el-button size="small" type="danger" @click="clearSuccessBins" :disabled="successBinCount === 0">
                {{ t.settings.clearPool }}
              </el-button>
            </el-button-group>
          </el-form-item>
          
          <el-alert
            :title="t.settings.importantNotice"
            type="warning"
            :closable="false"
            show-icon
            style="margin-top: 20px;"
          >
            <template #default>
              <div style="font-size: 12px; line-height: 1.6;">
                <p>{{ t.settings.privacyNotice }}</p>
                <p>{{ t.settings.testNotice }}</p>
                <p>{{ t.settings.termsNotice }}</p>
                <p>{{ t.settings.fraudNotice }}</p>
              </div>
            </template>
          </el-alert>
        </el-form>
      </el-tab-pane>
      
      <!-- 无感换号标签页 -->
      <el-tab-pane :label="t.settings.seamlessTab" name="seamless">
        <el-form :model="settings" label-width="140px">
          <el-form-item :label="t.settings.windsurfPath">
            <el-input
              v-model="windsurfPath"
              :placeholder="t.settings.windsurfPathPlaceholder"
              @blur="handlePathChange"
            >
              <template #append>
                <el-button-group>
                  <el-button @click="detectWindsurfPath" :loading="detectingPath">
                    {{ t.settings.autoDetect }}
                  </el-button>
                  <el-button @click="browseWindsurfPath">
                    {{ t.settings.browse }}
                  </el-button>
                </el-button-group>
              </template>
            </el-input>
            <div style="margin-top: 5px; color: #909399; font-size: 12px;">
              {{ t.settings.pathDesc }}
            </div>
          </el-form-item>
          
          <el-form-item :label="t.settings.enableSeamless">
            <el-switch 
              v-model="settings.seamlessSwitchEnabled"
              :active-text="t.accounts.active"
              :inactive-text="t.common.close"
              :loading="patchLoading"
              @change="handleSeamlessSwitch"
              :disabled="!windsurfPath"
            />
          </el-form-item>
          
          <el-form-item :label="t.settings.patchStatus">
            <el-tag v-if="patchStatus.installed" type="success">{{ t.settings.installed }}</el-tag>
            <el-tag v-else-if="patchStatus.error" type="danger">{{ patchStatus.error }}</el-tag>
            <el-tag v-else type="info">{{ t.settings.notInstalled }}</el-tag>
            <el-button 
              v-if="patchStatus.installed" 
              size="small" 
              style="margin-left: 10px;"
              @click="checkPatchStatus"
            >
              {{ t.settings.recheck }}
            </el-button>
          </el-form-item>
          
          <el-alert
            :title="t.settings.funcDesc"
            type="info"
            :closable="false"
            show-icon
            style="margin-top: 20px;"
          >
            <template #default>
              <div style="font-size: 12px; line-height: 1.6;">
                <p>{{ t.settings.seamlessDesc }}</p>
                <p>{{ t.settings.seamlessWarning }}</p>
              </div>
            </template>
          </el-alert>
          
          <el-divider content-position="left">{{ t.settings.windsurfViagra }}</el-divider>
          
          <el-form-item :label="t.settings.enableViagra">
            <el-switch 
              v-model="settings.cunzhiEnabled"
              :active-text="t.accounts.active"
              :inactive-text="t.common.close"
              :loading="cunzhiLoading"
              @change="handleCunzhiSwitch"
            />
          </el-form-item>
          
          <el-form-item :label="t.settings.viagraStatus">
            <el-tag v-if="cunzhiStatus.installed" type="success">{{ t.settings.installed }}</el-tag>
            <el-tag v-else-if="cunzhiStatus.error" type="danger">{{ cunzhiStatus.error }}</el-tag>
            <el-tag v-else type="info">{{ t.settings.notInstalled }}</el-tag>
            <el-button 
              v-if="cunzhiStatus.installed" 
              size="small" 
              style="margin-left: 10px;"
              @click="checkCunzhiStatus"
            >
              {{ t.settings.recheck }}
            </el-button>
          </el-form-item>
          
          <el-alert
            :title="t.settings.funcDesc"
            type="success"
            :closable="false"
            show-icon
            style="margin-top: 10px;"
          >
            <template #default>
              <div style="font-size: 12px; line-height: 1.6;">
                <p>{{ t.settings.viagraDesc }}</p>
                <p>{{ t.settings.viagraWarning }}</p>
              </div>
            </template>
          </el-alert>
        </el-form>
      </el-tab-pane>
    </el-tabs>
    
    <template #footer>
      <el-button @click="handleClose">{{ t.common.cancel }}</el-button>
      <el-button type="primary" @click="handleSave" :loading="loading">
        {{ t.common.save }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Connection } from '@element-plus/icons-vue';
import { useSettingsStore, useUIStore } from '@/store';
import { invoke } from '@tauri-apps/api/core';
import { useI18n } from '@/composables/useI18n';
import { systemApi } from '@/api';

const settingsStore = useSettingsStore();
const uiStore = useUIStore();
const { t } = useI18n();

const loading = ref(false);
const activeTab = ref('basic');  // 当前激活的标签页
const seatCountOptionsInput = ref('18, 19, 20');  // 座位数选项输入框
const resettingHttp = ref(false);  // HTTP客户端重置中

// 解析座位数选项
function parseSeatCountOptions() {
  const input = seatCountOptionsInput.value.trim();
  if (!input) {
    settings.seat_count_options = [18, 19, 20];
    seatCountOptionsInput.value = '18, 19, 20';
    return;
  }
  
  const numbers = input.split(/[,，\s]+/)
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !isNaN(n) && n > 0);
  
  if (numbers.length === 0) {
    ElMessage.warning(t.value.settings.invalidSeatCount);
    settings.seat_count_options = [18, 19, 20];
    seatCountOptionsInput.value = '18, 19, 20';
  } else {
    settings.seat_count_options = numbers;
    seatCountOptionsInput.value = numbers.join(', ');
  }
}

const settings = reactive<{
  auto_refresh_token: boolean;
  seat_count_options: number[];
  retry_times: number;
  theme: string;
  concurrent_limit: number;
  show_seats_result_dialog: boolean;
  autoOpenPaymentLinkInWebview: boolean;
  autoFillPaymentForm: boolean;
  autoSubmitPaymentForm: boolean;
  paymentPageDelay: number;
  showVirtualCardInfo: boolean;
  customCardBin: string;
  customCardBinRange: string;
  cardBindRetryTimes: number;
  testModeEnabled: boolean;
  useLocalSuccessBins: boolean;
  seamlessSwitchEnabled: boolean;
  windsurfPath: string | null;
  patchBackupPath: string | null;
  autoOpenBrowser: boolean;
  browserMode: 'incognito' | 'normal';
  privacyMode: boolean;
  unlimitedConcurrentRefresh: boolean;
  proxyEnabled: boolean;
  proxyUrl: string | null;
  useLightweightApi: boolean;
  cunzhiEnabled: boolean;
}>({
  auto_refresh_token: true,
  seat_count_options: [18, 19, 20],
  retry_times: 2,
  theme: 'light',
  concurrent_limit: 5,
  show_seats_result_dialog: false,  // 默认关闭
  autoOpenPaymentLinkInWebview: false,  // 默认关闭自动打开支付页面
  autoFillPaymentForm: false,  // 默认关闭自动填写表单
  autoSubmitPaymentForm: false,  // 默认关闭自动提交
  paymentPageDelay: 2,  // 默认延迟2秒
  showVirtualCardInfo: false,  // 默认关闭虚拟卡信息弹窗
  customCardBin: '626202',  // 默认卡头
  customCardBinRange: '',  // 默认不使用卡段范围
  cardBindRetryTimes: 5,  // 默认绑卡重试5次
  testModeEnabled: false,  // 默认关闭测试模式
  useLocalSuccessBins: false,  // 默认不使用本地BIN池
  seamlessSwitchEnabled: false,  // 默认关闭无感换号
  windsurfPath: null,  // Windsurf路径
  patchBackupPath: null,  // 补丁备份路径
  autoOpenBrowser: true,  // 默认自动打开浏览器
  browserMode: 'incognito',  // 默认无痕模式
  privacyMode: false,  // 默认关闭隐私模式
  unlimitedConcurrentRefresh: false,  // 默认关闭全量并发刷新
  proxyEnabled: false,  // 默认关闭代理
  proxyUrl: null,  // 默认无代理地址
  useLightweightApi: true,  // 默认使用轻量级API
  cunzhiEnabled: false,  // 默认关闭伟哥功能
});

// 成功BIN池相关
const successBinCount = ref(0);
const testModeProgress = ref<string | null>(null);

async function loadSuccessBinCount() {
  try {
    const bins = await invoke<string[]>('get_success_bins');
    successBinCount.value = bins.length;
  } catch (e) {
    successBinCount.value = 0;
  }
}

async function loadTestModeProgress() {
  try {
    testModeProgress.value = await invoke<string | null>('get_test_mode_progress');
  } catch (e) {
    testModeProgress.value = null;
  }
}

async function resetTestModeProgress() {
  try {
    await ElMessageBox.confirm(t.value.settings.confirmResetProgress, t.value.settings.confirmResetTitle, {
      type: 'warning'
    });
    await invoke('reset_test_mode_progress');
    testModeProgress.value = null;
    ElMessage.success(t.value.settings.progressReset);
  } catch (e) {
    // 用户取消
  }
}

async function viewSuccessBins() {
  try {
    const bins = await invoke<string[]>('get_success_bins');
    if (bins.length === 0) {
      ElMessage.info(t.value.settings.poolEmpty);
      return;
    }
    ElMessageBox.alert(
      `<div style="max-height: 300px; overflow-y: auto;">
        <p><b>${t.value.settings.poolContent.replace('{count}', String(bins.length))}</b></p>
        <p style="font-family: monospace; word-break: break-all;">${bins.join(', ')}</p>
      </div>`,
      t.value.settings.poolTitle,
      { dangerouslyUseHTMLString: true }
    );
  } catch (e) {
    ElMessage.error(t.value.settings.getPoolFailed);
  }
}

async function clearSuccessBins() {
  try {
    await ElMessageBox.confirm(t.value.settings.confirmClearPool, t.value.settings.confirmClearTitle, {
      type: 'warning'
    });
    await invoke('clear_success_bins');
    successBinCount.value = 0;
    ElMessage.success(t.value.settings.poolCleared);
  } catch (e) {
    // 用户取消
  }
}

// 无感换号相关
const windsurfPath = ref('');
const detectingPath = ref(false);
const patchLoading = ref(false);
const patchStatus = reactive({
  installed: false,
  error: '',
});

// 伟哥(寸止)相关
const cunzhiLoading = ref(false);
const cunzhiStatus = reactive({
  installed: false,
  error: '',
});

watch(() => uiStore.showSettingsDialog, async (show) => {
  if (show && settingsStore.settings) {
    Object.assign(settings, settingsStore.settings);
    windsurfPath.value = settings.windsurfPath || '';
    // 同步座位数选项到输入框
    if (settings.seat_count_options && settings.seat_count_options.length > 0) {
      seatCountOptionsInput.value = settings.seat_count_options.join(', ');
    }
    // 检查补丁状态
    if (windsurfPath.value) {
      await checkPatchStatus();
    }
    // 检查伟哥状态
    await checkCunzhiStatus();
    // 加载成功BIN池数量和测试模式进度
    await loadSuccessBinCount();
    await loadTestModeProgress();
  }
});

onMounted(async () => {
  // 如果已有路径，检查状态
  const storedPath = (settingsStore.settings as any)?.windsurfPath;
  if (storedPath) {
    settings.windsurfPath = storedPath;
    windsurfPath.value = storedPath;
    await checkPatchStatus();
  }
});

async function handleSave() {
  loading.value = true;
  try {
    // 确保保存路径设置
    if (windsurfPath.value) {
      settings.windsurfPath = windsurfPath.value;
    }
    await settingsStore.updateSettings(settings);
    uiStore.setTheme(settings.theme as 'light' | 'dark');
    ElMessage.success(t.value.settings.saveSuccess);
    handleClose();
  } catch (error) {
    ElMessage.error(`${t.value.settings.saveFailed}: ${error}`);
  } finally {
    loading.value = false;
  }
}

function handleClose() {
  uiStore.showSettingsDialog = false;
}

// 验证卡头输入
function validateCardBin(value: string) {
  // 只允许数字
  const cleaned = value.replace(/[^\d]/g, '');
  settings.customCardBin = cleaned;
  
  // 检查长度
  if (cleaned.length > 0 && cleaned.length < 4) {
    ElMessage.warning(t.value.settings.invalidCardBin);
  }
}

// 恢复默认卡头
function resetCardBin() {
  settings.customCardBin = '626202';
  ElMessage.success(t.value.settings.resetDefaultBin);
}

// 验证卡段范围格式
function validateCardBinRange(value: string) {
  // 只允许数字和连字符
  const cleaned = value.replace(/[^\d-]/g, '');
  settings.customCardBinRange = cleaned;
  
  // 如果输入了内容，验证格式
  if (cleaned && cleaned.includes('-')) {
    const parts = cleaned.split('-');
    if (parts.length === 2) {
      const [start, end] = parts;
      // 验证两端长度相同且都是数字
      if (start && end && start.length === end.length) {
        const startNum = parseInt(start, 10);
        const endNum = parseInt(end, 10);
        if (startNum > endNum) {
          ElMessage.warning(t.value.settings.invalidBinRangeStartEnd);
        }
      } else if (start && end && start.length !== end.length) {
        ElMessage.warning(t.value.settings.invalidBinRangeLength);
      }
    }
  }
}

// 清除卡段范围
function clearCardBinRange() {
  settings.customCardBinRange = '';
  ElMessage.success(t.value.settings.clearedBinRange);
}

// 检测Windsurf路径
async function detectWindsurfPath() {
  detectingPath.value = true;
  try {
    const path = await invoke<string>('get_windsurf_path');
    windsurfPath.value = path;
    settings.windsurfPath = path;
    ElMessage.success(t.value.settings.pathFound);
    // 检查补丁状态
    await checkPatchStatus();
    // 保存路径设置到本地
    await settingsStore.updateSettings(settings);
  } catch (error) {
    ElMessage.error(t.value.settings.detectFailed.replace('{error}', String(error)));
    windsurfPath.value = '';
  } finally {
    detectingPath.value = false;
  }
}

// 检查补丁状态
async function checkPatchStatus() {
  if (!windsurfPath.value) return;
  
  try {
    const status = await invoke<any>('check_patch_status', {
      windsurfPath: windsurfPath.value
    });
    patchStatus.installed = status.installed;
    patchStatus.error = status.error || '';
    
    // 同步开关状态与实际补丁状态
    if (status.installed !== settings.seamlessSwitchEnabled) {
      settings.seamlessSwitchEnabled = status.installed;
      // 保存同步后的状态
      await settingsStore.updateSettings(settings);
    }
  } catch (error) {
    patchStatus.installed = false;
    patchStatus.error = error as string;
  }
}

// 处理路径变化
function handlePathChange() {
  if (windsurfPath.value) {
    settings.windsurfPath = windsurfPath.value;
    // 检查新路径的补丁状态
    checkPatchStatus();
  }
}

// 浏览选择路径
async function browseWindsurfPath() {
  try {
    const { open } = await import('@tauri-apps/plugin-dialog');
    const selected = await open({
      directory: true,
      multiple: false,
      title: t.value.settings.selectDir
    });
    
    if (selected && typeof selected === 'string') {
      // 验证选择的路径是否包含extension.js文件
      const isValid = await invoke<boolean>('validate_windsurf_path', {
        path: selected
      });
      
      if (isValid) {
        windsurfPath.value = selected;
        settings.windsurfPath = selected;
        ElMessage.success(t.value.settings.pathSelected);
        await checkPatchStatus();
        // 保存路径设置到本地
        await settingsStore.updateSettings(settings);
      } else {
        ElMessage.error(t.value.settings.invalidPath);
      }
    }
  } catch (error) {
    ElMessage.error(t.value.settings.selectPathFailed.replace('{error}', String(error)));
  }
}

// 处理无感换号开关
async function handleSeamlessSwitch(value: boolean) {
  if (!windsurfPath.value) {
    ElMessage.error(t.value.settings.setPathFirst);
    settings.seamlessSwitchEnabled = !value;
    return;
  }
  
  // 确认对话框
  const action = value ? t.value.settings.enable : t.value.settings.disable;
  const message = value 
    ? t.value.settings.seamlessConfirmEnable
    : t.value.settings.seamlessConfirmDisable;
  
  try {
    await ElMessageBox.confirm(
      message,
      t.value.settings.seamlessConfirmTitle.replace('{action}', action),
      {
        confirmButtonText: t.value.common.confirm,
        cancelButtonText: t.value.common.cancel,
        type: 'warning',
      }
    );
  } catch {
    // 用户取消，恢复开关状态
    settings.seamlessSwitchEnabled = !value;
    return;
  }
  
  patchLoading.value = true;
  try {
    let result;
    if (value) {
      // 应用补丁
      result = await invoke<any>('apply_seamless_patch', {
        windsurfPath: windsurfPath.value
      });
    } else {
      // 还原补丁
      result = await invoke<any>('restore_seamless_patch');
    }
    
    if (result.success) {
      ElMessage.success(result.message || t.value.settings.opSuccess.replace('{action}', action));
      if (result.already_patched) {
        ElMessage.info(t.value.settings.patchAlreadyApplied);
      }
      // 更新状态
      await checkPatchStatus();
      // 保存设置到本地
      settings.windsurfPath = windsurfPath.value;
      settings.patchBackupPath = result.backup_file || settings.patchBackupPath;
      // 立即保存到本地文件
      await settingsStore.updateSettings(settings);
    } else {
      ElMessage.error(result.message || t.value.settings.opFailed.replace('{action}', action));
      settings.seamlessSwitchEnabled = !value;
    }
  } catch (error) {
    ElMessage.error(t.value.settings.opFailed.replace('{action}', action) + `: ${error}`);
    settings.seamlessSwitchEnabled = !value;
  } finally {
    patchLoading.value = false;
  }
}

// 重置HTTP客户端
async function handleResetHttpClient() {
  resettingHttp.value = true;
  try {
    const result = await systemApi.resetHttpClient();
    if (result.success) {
      ElMessage.success(result.message || t.value.settings.httpResetSuccess);
    } else {
      ElMessage.error(t.value.settings.httpResetFailed);
    }
  } catch (error) {
    ElMessage.error(`${t.value.settings.httpResetFailed}: ${error}`);
  } finally {
    resettingHttp.value = false;
  }
}

// 检查伟哥(寸止)状态
async function checkCunzhiStatus() {
  try {
    const status = await invoke<any>('check_cunzhi_status');
    cunzhiStatus.installed = status.installed;
    cunzhiStatus.error = status.error || '';
    
    // 同步开关状态与实际状态
    if (status.installed !== settings.cunzhiEnabled) {
      settings.cunzhiEnabled = status.installed;
      await settingsStore.updateSettings(settings);
    }
  } catch (error) {
    cunzhiStatus.installed = false;
    cunzhiStatus.error = error as string;
  }
}

// 处理伟哥开关
async function handleCunzhiSwitch(value: boolean) {
  const action = value ? t.value.settings.enable : t.value.settings.disable;
  const message = value 
    ? t.value.settings.viagraConfirmEnable
    : t.value.settings.viagraConfirmDisable;
  
  try {
    await ElMessageBox.confirm(
      message,
      t.value.settings.viagraConfirmTitle.replace('{action}', action),
      {
        confirmButtonText: t.value.common.confirm,
        cancelButtonText: t.value.common.cancel,
        type: 'warning',
      }
    );
  } catch {
    // 用户取消，恢复开关状态
    settings.cunzhiEnabled = !value;
    return;
  }
  
  cunzhiLoading.value = true;
  try {
    let result;
    if (value) {
      // 安装伟哥
      result = await invoke<any>('install_cunzhi', { windsurfPath: settings.windsurfPath || null });
    } else {
      // 卸载伟哥
      result = await invoke<any>('uninstall_cunzhi', { windsurfPath: settings.windsurfPath || null });
    }
    
    if (result.success) {
      ElMessage.success(result.message || t.value.settings.viagraSuccess.replace('{action}', action));
      // 更新状态
      await checkCunzhiStatus();
      // 保存设置
      await settingsStore.updateSettings(settings);
      // 提示重启
      ElMessage.warning(t.value.settings.restartWarning);
    } else {
      ElMessage.error(result.message || t.value.settings.opFailed.replace('{action}', action));
      settings.cunzhiEnabled = !value;
    }
  } catch (error) {
    ElMessage.error(t.value.settings.opFailed.replace('{action}', action) + `: ${error}`);
    settings.cunzhiEnabled = !value;
  } finally {
    cunzhiLoading.value = false;
  }
}

// simple 版本已禁用的功能
void parseSeatCountOptions;
</script>

<style scoped>
/* 深色模式样式 */
:deep(.el-dialog) {
  /* 在深色模式下由全局样式控制 */
}

/* 深色模式下的描述文字 */
:root.dark .el-form-item > div[style*="color: #909399"] {
  color: #94a3b8 !important;
}

/* 深色模式下的标签页内容 */
:root.dark .el-tabs__content {
  background-color: transparent;
}

/* 深色模式下的表单项标签 */
:root.dark .el-form-item__label {
  color: #cfd3dc;
}

/* 深色模式下的alert */
:root.dark .el-alert--warning {
  background-color: rgba(230, 162, 60, 0.1);
  border-color: rgba(230, 162, 60, 0.3);
}

:root.dark .el-alert--warning .el-alert__description {
  color: #cfd3dc;
}
</style>
