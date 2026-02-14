<template>
  <el-dialog
    v-model="visible"
    width="960px"
    :close-on-click-modal="false"
    :show-close="false"
    class="auto-reset-dialog"
    @close="handleClose"
  >
    <!-- ???????? -->
    <template #header>
      <div class="dialog-header">
        <div class="header-title">
          <div class="header-icon">
            <el-icon><Timer /></el-icon>
          </div>
          <h3 class="header-text">{{ t.menu.autoReset }}</h3>
        </div>
        <el-button :icon="Close" circle @click="visible = false" class="close-btn" />
      </div>
    </template>
    
    <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="custom-tabs">
      <!-- Tab 1: ???? -->
      <el-tab-pane :label="t.accounts.autoReset.ruleConfig" name="rules">
        <div class="tab-content">
          <!-- ?????? -->
          <el-card class="add-config-card" shadow="never">
            <template #header>
              <div class="card-header">
                <span>{{ t.accounts.autoReset.addRule }}</span>
              </div>
            </template>
            
            <el-form :model="newConfig" label-width="100px" size="default">
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item :label="t.accounts.autoReset.targetType">
                    <el-radio-group v-model="newConfig.targetType" @change="handleTargetTypeChange">
                      <el-radio value="group">{{ t.accounts.autoReset.byGroup }}</el-radio>
                      <el-radio value="account">{{ t.accounts.autoReset.byAccount }}</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="t.accounts.autoReset.selectTarget">
                    <el-select 
                      v-if="newConfig.targetType === 'group'"
                      v-model="newConfig.targetId" 
                      :placeholder="t.accounts.autoReset.selectTarget"
                      style="width: 100%;"
                    >
                      <el-option
                        v-for="group in settingsStore.groups"
                        :key="group"
                        :label="getGroupLabel(group)"
                        :value="group"
                      >
                        <div class="group-option">
                          <span>{{ group }}</span>
                          <span class="group-stats">
                            <el-tag type="primary" size="small">{{ t.accounts.autoReset.masterAccount }}{{ getGroupStats(group).masters }}</el-tag>
                            <el-tag type="info" size="small">{{ t.accounts.autoReset.masterAccount }}{{ getGroupStats(group).members }}</el-tag>
                          </span>
                        </div>
                      </el-option>
                    </el-select>
                    <el-select 
                      v-else
                      v-model="newConfig.targetId" 
                      :placeholder="t.accounts.autoReset.selectTarget"
                      filterable
                      style="width: 100%;"
                    >
                      <el-option
                        v-for="account in accountsStore.accounts"
                        :key="account.id"
                        :label="account.email"
                        :value="account.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-row :gutter="16">
                <el-col :span="8">
                  <el-form-item :label="t.accounts.autoReset.checkInterval">
                    <el-input-number
                      v-model="newConfig.checkInterval"
                      :min="1"
                      :max="1440"
                      style="width: 100%;"
                    />
                    <span class="unit-label">{{ t.accounts.autoReset.minutes }}</span>
                    <div class="interval-presets">
                      <el-button size="small" text @click="newConfig.checkInterval = 5">5</el-button>
                      <el-button size="small" text @click="newConfig.checkInterval = 10">10</el-button>
                      <el-button size="small" text @click="newConfig.checkInterval = 30">30</el-button>
                      <el-button size="small" text @click="newConfig.checkInterval = 60">60</el-button>
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="t.accounts.autoReset.usageThreshold">
                    <el-input-number
                      v-model="newConfig.usageThreshold"
                      :min="1"
                      :max="100"
                      style="width: 100%;"
                    />
                    <span class="unit-label">%</span>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="t.accounts.autoReset.remainingThreshold">
                    <el-input-number
                      v-model="newConfig.remainingThreshold"
                      :min="0"
                      :max="100000"
                      :step="100"
                      style="width: 100%;"
                    />
                    <span class="unit-label">{{ t.accounts.autoReset.credits }}</span>
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-form-item>
                <el-button type="primary" @click="handleAddConfig" :loading="adding">
                  <el-icon><Plus /></el-icon>
                  {{ t.accounts.autoReset.addRuleBtn }}
                </el-button>
                <span class="tip-text">
                  {{ t.accounts.autoReset.triggerCondition.replace('{usage}', String(newConfig.usageThreshold)).replace('{remaining}', String(newConfig.remainingThreshold)) }}
                </span>
              </el-form-item>
            </el-form>
          </el-card>
          
          <!-- ???????? -->
          <el-card class="config-list-card" shadow="never">
            <template #header>
              <div class="card-header">
                <div class="header-left">
                  <span>{{ t.accounts.autoReset.configuredRules }} ({{ filteredConfigs.length }}/{{ configs.length }})</span>
                  <el-pagination
                    v-if="filteredConfigs.length > 0"
                    v-model:current-page="configCurrentPage"
                    v-model:page-size="configPageSize"
                    :page-sizes="[5, 10, 20, 50]"
                    :total="filteredConfigs.length"
                    layout="sizes, prev, pager, next"
                    size="small"
                    class="header-pagination"
                  />
                </div>
                <div class="header-actions">
                  <el-input
                    v-model="searchKeyword"
                    :placeholder="t.accounts.autoReset.searchPlaceholder"
                    :prefix-icon="Search"
                    clearable
                    size="small"
                    style="width: 160px;"
                  />
                  <el-button 
                    v-if="filteredConfigs.length > 0" 
                    type="primary" 
                    link 
                    @click="handleCheckAll"
                    :loading="checkingAll"
                  >
                    <el-icon><Refresh /></el-icon>
                    {{ t.accounts.autoReset.check }}
                  </el-button>
                  <el-button 
                    v-if="filteredConfigs.length > 0" 
                    type="warning" 
                    link 
                    @click="handleResetAll"
                    :loading="resettingAll"
                  >
                    <el-icon><RefreshRight /></el-icon>
                    {{ t.accounts.autoReset.resetAll }}
                  </el-button>
                </div>
              </div>
            </template>
            
            <el-table :data="paginatedConfigs" v-loading="loading" :empty-text="t.accounts.autoReset.noRules">
              <el-table-column :label="t.accounts.autoReset.selectTarget" min-width="280">
                <template #default="{ row }">
                  <div class="target-info">
                    <el-tag :type="row.targetType === 'group' ? 'primary' : 'success'" size="small">
                      {{ row.targetType === 'group' ? t.accounts.autoReset.byGroup : t.accounts.autoReset.byAccount }}
                    </el-tag>
                    <span class="target-name">
                      {{ getTargetEmail(row) }}
                      <span v-if="getTargetNickname(row)" class="nickname">({{ getTargetNickname(row) }})</span>
                    </span>
                    <span v-if="row.targetType === 'group'" class="group-info">
                      <el-tag type="warning" size="small" effect="plain">{{ t.accounts.autoReset.masterAccount }}{{ getGroupStats(row.targetId).masters }}</el-tag>
                      <el-tag type="info" size="small" effect="plain">{{ t.accounts.autoReset.masterAccount }}{{ getGroupStats(row.targetId).members }}</el-tag>
                    </span>
                  </div>
                </template>
              </el-table-column>
              
              <el-table-column :label="t.accounts.autoReset.checkInterval" width="90" align="center">
                <template #default="{ row }">
                  {{ row.checkInterval }}{{ t.accounts.autoReset.minutes }}
                </template>
              </el-table-column>
              
              <el-table-column :label="t.accounts.autoReset.triggerCondition" width="140">
                <template #default="{ row }">
                  <div class="condition-info">
                    <span>{{ t.accounts.autoReset.usageThreshold }} ? {{ row.usageThreshold }}%</span>
                    <span>{{ t.accounts.autoReset.remainingThreshold }} ? {{ row.remainingThreshold }}</span>
                  </div>
                </template>
              </el-table-column>
              
              <el-table-column :label="t.accounts.autoReset.lastCheck" width="120">
                <template #default="{ row }">
                  <span v-if="row.lastCheckAt">{{ formatTime(row.lastCheckAt) }}</span>
                  <span v-else class="no-data">-</span>
                </template>
              </el-table-column>
              
              <el-table-column :label="t.accounts.autoReset.lastReset" width="120">
                <template #default="{ row }">
                  <span v-if="row.lastResetAt">{{ formatTime(row.lastResetAt) }}</span>
                  <span v-else class="no-data">-</span>
                </template>
              </el-table-column>
              
              <el-table-column :label="t.accounts.autoReset.status" width="70" align="center">
                <template #default="{ row }">
                  <el-switch
                    v-model="row.enabled"
                    @change="(val: boolean) => handleToggleEnabled(row, val)"
                    :loading="row._updating"
                  />
                </template>
              </el-table-column>
              
              <el-table-column :label="t.accounts.autoReset.actions" width="150" align="center">
                <template #default="{ row }">
                  <el-button type="primary" link size="small" @click="handleEditConfig(row)">{{ t.accounts.autoReset.edit }}</el-button>
                  <el-button type="success" link size="small" @click="handleCheckNow(row)" :loading="row._checking">{{ t.accounts.autoReset.check }}</el-button>
                  <el-button type="warning" link size="small" @click="handleResetNow(row)" :loading="row._resetting">{{ t.accounts.autoReset.reset }}</el-button>
                  <el-button type="danger" link size="small" @click="handleDeleteConfig(row)">{{ t.accounts.autoReset.delete }}</el-button>
                </template>
              </el-table-column>
            </el-table>
            
          </el-card>
        </div>
      </el-tab-pane>
      
      <!-- Tab 2: ???? -->
      <el-tab-pane :label="t.accounts.autoReset.resetRecords" name="records">
        <div class="tab-content">
          <el-card shadow="never">
            <template #header>
              <div class="card-header">
                <span>{{ t.accounts.autoReset.resetRecords }} ({{ recordsTotal }})</span>
                <el-button v-if="recordsTotal > 0" type="danger" link @click="handleClearRecords">
                  <el-icon><Delete /></el-icon>
                  {{ t.accounts.autoReset.clearRecords }}
                </el-button>
              </div>
            </template>
            
            <el-table :data="records" v-loading="recordsLoading" :empty-text="t.accounts.autoReset.noRecords">
              <el-table-column :label="t.accounts.autoReset.byAccount" min-width="200">
                <template #default="{ row }">
                  <div>
                    <span>{{ row.account_email }}</span>
                    <span v-if="row.account_nickname" class="nickname">({{ row.account_nickname }})</span>
                  </div>
                </template>
              </el-table-column>
              
              <el-table-column :label="t.accounts.autoReset.masterAccount" min-width="180">
                <template #default="{ row }">
                  {{ row.master_email }}
                </template>
              </el-table-column>
              
              <el-table-column :label="t.accounts.autoReset.usedBefore" width="120" align="center">
                <template #default="{ row }">
                  <span>{{ formatNumber(row.used_quota_before / 100) }}</span>
                  <span class="usage-percent">({{ row.usage_percent }}%)</span>
                </template>
              </el-table-column>
              
              <el-table-column :label="t.accounts.autoReset.totalQuota" width="100" align="center">
                <template #default="{ row }">
                  {{ formatNumber(row.total_quota / 100) }}
                </template>
              </el-table-column>
              
              <el-table-column :label="t.accounts.autoReset.autoJoined" width="80" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.auto_joined ? 'success' : 'info'" size="small">
                    {{ row.auto_joined ? t.common.yes : t.common.no }}
                  </el-tag>
                </template>
              </el-table-column>
              
              <el-table-column :label="t.accounts.autoReset.resetTime" width="160">
                <template #default="{ row }">
                  {{ formatFullTime(row.reset_at) }}
                </template>
              </el-table-column>
            </el-table>
            
            <!-- ???? -->
            <div class="pagination-wrapper">
              <el-pagination
                v-model:current-page="recordsPage"
                v-model:page-size="recordsPageSize"
                :page-sizes="pageSizeOptions"
                :total="recordsTotal"
                layout="total, sizes, prev, pager, next"
                size="small"
                @current-change="loadRecords"
                @size-change="loadRecords"
              />
            </div>
          </el-card>
        </div>
      </el-tab-pane>
      
      <!-- Tab 3: Stats Overview -->
      <el-tab-pane :label="t.accounts.autoReset.statsOverview" name="stats">
        <div class="tab-content">
          <el-card shadow="never">
            <template #header>
              <div class="card-header">
                <span>{{ t.accounts.autoReset.accountResetStats }} ({{ statsTotal }})</span>
              </div>
            </template>
            
            <el-table :data="stats" v-loading="statsLoading" :empty-text="t.accounts.autoReset.noStats">
              <el-table-column :label="t.accounts.autoReset.byAccount" min-width="200">
                <template #default="{ row }">
                  <div>
                    <span>{{ row.account_email }}</span>
                    <span v-if="row.account_nickname" class="nickname">({{ row.account_nickname }})</span>
                  </div>
                </template>
              </el-table-column>
              
              <el-table-column :label="t.accounts.autoReset.resetCount" width="100" align="center">
                <template #default="{ row }">
                  <el-tag type="primary">{{ row.reset_count }}</el-tag>
                </template>
              </el-table-column>
              
              <el-table-column :label="t.accounts.autoReset.totalUsedQuota" width="140" align="center">
                <template #default="{ row }">
                  {{ formatNumber(row.total_used_quota / 100) }}
                </template>
              </el-table-column>
              
              <el-table-column :label="t.accounts.autoReset.avgUsagePerReset" width="140" align="center">
                <template #default="{ row }">
                  {{ row.reset_count > 0 ? formatNumber(Math.round(row.total_used_quota / row.reset_count / 100)) : '-' }}
                </template>
              </el-table-column>
              
              <el-table-column :label="t.accounts.autoReset.lastReset" width="160">
                <template #default="{ row }">
                  <span v-if="row.last_reset_at">{{ formatFullTime(row.last_reset_at) }}</span>
                  <span v-else class="no-data">-</span>
                </template>
              </el-table-column>
            </el-table>
            
            <!-- ???? -->
            <div class="pagination-wrapper">
              <el-pagination
                v-model:current-page="statsPage"
                v-model:page-size="statsPageSize"
                :page-sizes="pageSizeOptions"
                :total="statsTotal"
                layout="total, sizes, prev, pager, next"
                size="small"
                @current-change="loadStats"
                @size-change="loadStats"
              />
            </div>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <!-- ????? -->
    <el-dialog
      v-model="showEditDialog"
      :title="t.accounts.autoReset.editRule"
      width="450px"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-form :model="editForm" label-width="100px" v-if="editingConfig">
        <el-form-item :label="t.accounts.autoReset.selectTarget">
          <span>{{ getTargetName(editingConfig) }}</span>
        </el-form-item>
        
        <el-form-item :label="t.accounts.autoReset.checkInterval">
          <el-input-number
            v-model="editForm.checkInterval"
            :min="1"
            :max="1440"
            style="width: 100%;"
          />
          <span class="unit-label">{{ t.accounts.autoReset.minutes }}</span>
          <div class="interval-presets">
            <el-button size="small" text @click="editForm.checkInterval = 5">5 {{ t.accounts.autoReset.minutes }}</el-button>
            <el-button size="small" text @click="editForm.checkInterval = 10">10 {{ t.accounts.autoReset.minutes }}</el-button>
            <el-button size="small" text @click="editForm.checkInterval = 30">30 {{ t.accounts.autoReset.minutes }}</el-button>
            <el-button size="small" text @click="editForm.checkInterval = 60">60 {{ t.accounts.autoReset.minutes }}</el-button>
          </div>
        </el-form-item>
        
        <el-form-item :label="t.accounts.autoReset.usageThreshold">
          <el-input-number
            v-model="editForm.usageThreshold"
            :min="1"
            :max="100"
            style="width: 100%;"
          />
          <span class="unit-label">%</span>
        </el-form-item>
        
        <el-form-item :label="t.accounts.autoReset.remainingThreshold">
          <el-input-number
            v-model="editForm.remainingThreshold"
            :min="0"
            :max="100000"
            :step="100"
            style="width: 100%;"
          />
          <span class="unit-label">{{ t.accounts.autoReset.credits }}</span>
        </el-form-item>
        
        <el-form-item>
          <span class="tip-text">
            {{ t.accounts.autoReset.whenUsageGte }} {{ editForm.usageThreshold }}% {{ t.accounts.autoReset.andRemainingLte }} {{ editForm.remainingThreshold }} {{ t.accounts.autoReset.triggerReset }}
          </span>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showEditDialog = false">{{ t.common.cancel }}</el-button>
        <el-button type="primary" @click="handleSaveEdit">{{ t.common.save }}</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Refresh, RefreshRight, Search, Delete, Close, Timer } from '@element-plus/icons-vue';
import { invoke } from '@tauri-apps/api/core';
import { useAccountsStore, useSettingsStore } from '@/store';
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n();

interface AutoResetConfig {
  id: string;
  targetType: string;
  targetId: string;
  enabled: boolean;
  checkInterval: number;
  usageThreshold: number;
  remainingThreshold: number;
  lastCheckAt: string | null;
  lastResetAt: string | null;
  createdAt: string;
  _updating?: boolean;
  _checking?: boolean;
  _resetting?: boolean;
}

interface ResetRecord {
  id: string;
  config_id: string;
  account_id: string;
  account_email: string;
  account_nickname: string | null;
  master_email: string;
  used_quota_before: number;
  total_quota: number;
  usage_percent: number;
  auto_joined: boolean;
  reset_at: string;
}

interface AccountResetStats {
  account_id: string;
  account_email: string;
  account_nickname: string | null;
  reset_count: number;
  total_used_quota: number;
  last_reset_at: string | null;
}

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const accountsStore = useAccountsStore();
const settingsStore = useSettingsStore();

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

// Tab ??
const activeTab = ref('rules');

// ????
const pageSizeOptions = [10, 20, 50, 100, 200];

// ??????
const loading = ref(false);
const adding = ref(false);
const checkingAll = ref(false);
const resettingAll = ref(false);
const searchKeyword = ref('');
const configs = ref<AutoResetConfig[]>([]);
const configCurrentPage = ref(1);
const configPageSize = ref(20);

// ??????
const recordsLoading = ref(false);
const records = ref<ResetRecord[]>([]);
const recordsPage = ref(1);
const recordsPageSize = ref(20);
const recordsTotal = ref(0);

// Stats overview
const statsLoading = ref(false);
const stats = ref<AccountResetStats[]>([]);
const statsPage = ref(1);
const statsPageSize = ref(20);
const statsTotal = ref(0);

// ???ID??
const timerMap = ref<Map<string, ReturnType<typeof setInterval>>>(new Map());

const newConfig = ref({
  targetType: 'group',
  targetId: '',
  checkInterval: 5,
  usageThreshold: 80,
  remainingThreshold: 1000,
});

// ??????
const showEditDialog = ref(false);
const editingConfig = ref<AutoResetConfig | null>(null);
const editForm = ref({
  checkInterval: 5,
  usageThreshold: 80,
  remainingThreshold: 1000,
});

// ????????
const filteredConfigs = computed(() => {
  if (!searchKeyword.value.trim()) return configs.value;
  const keyword = searchKeyword.value.toLowerCase().trim();
  return configs.value.filter(config => {
    const targetName = getTargetName(config).toLowerCase();
    return targetName.includes(keyword);
  });
});

// ????????
const paginatedConfigs = computed(() => {
  const start = (configCurrentPage.value - 1) * configPageSize.value;
  const end = start + configPageSize.value;
  return filteredConfigs.value.slice(start, end);
});

// ????
async function loadConfigs() {
  loading.value = true;
  try {
    const result = await invoke<AutoResetConfig[]>('get_auto_reset_configs');
    configs.value = result.map(c => ({ ...c, _updating: false, _checking: false, _resetting: false }));
    setupTimers();
  } catch (error) {
    console.error('??????????:', error);
  } finally {
    loading.value = false;
  }
}

// ??????
async function loadRecords() {
  recordsLoading.value = true;
  try {
    const result = await invoke<any>('get_reset_records', {
      page: recordsPage.value,
      pageSize: recordsPageSize.value,
    });
    records.value = result.records;
    recordsTotal.value = result.total;
  } catch (error) {
    console.error('????????:', error);
  } finally {
    recordsLoading.value = false;
  }
}

// ??????
async function loadStats() {
  statsLoading.value = true;
  try {
    const result = await invoke<any>('get_reset_stats', {
      page: statsPage.value,
      pageSize: statsPageSize.value,
    });
    stats.value = result.stats;
    statsTotal.value = result.total;
  } catch (error) {
    console.error('????????:', error);
  } finally {
    statsLoading.value = false;
  }
}

// Tab ????
function handleTabChange(tab: string) {
  if (tab === 'records') {
    loadRecords();
  } else if (tab === 'stats') {
    loadStats();
  }
}

// ?????
function setupTimers() {
  timerMap.value.forEach(timer => clearInterval(timer));
  timerMap.value.clear();
  
  configs.value.filter(c => c.enabled).forEach(config => {
    const timer = setInterval(() => {
      executeCheck(config.id);
    }, config.checkInterval * 60 * 1000);
    timerMap.value.set(config.id, timer);
  });
}

// ????
async function executeCheck(configId: string) {
  try {
    const result = await invoke<any>('check_and_auto_reset', { configId });
    if (result.reset_count > 0) {
      ElMessage.success(`????: ??? ${result.reset_count} ????{{ t.accounts.autoReset.credits }}`);
      await accountsStore.loadAccounts();
    }
    await loadConfigs();
  } catch (error) {
    console.error('????????:', error);
  }
}

// ??????/???
function getTargetEmail(config: AutoResetConfig): string {
  if (config.targetType === 'group') {
    return config.targetId;
  } else {
    const account = accountsStore.accounts.find(a => a.id === config.targetId);
    return account?.email || config.targetId;
  }
}

// ??????
function getTargetNickname(config: AutoResetConfig): string | null {
  if (config.targetType === 'group') {
    return null;
  } else {
    const account = accountsStore.accounts.find(a => a.id === config.targetId);
    if (!account) return null;
    return account.nickname && account.nickname !== account.email ? account.nickname : null;
  }
}

// ??????(??)
function getTargetName(config: AutoResetConfig): string {
  const email = getTargetEmail(config);
  const nickname = getTargetNickname(config);
  return nickname ? `${email} (${nickname})` : email;
}

// ??{{ row.auto_joined ? t.common.yes : t.common.no }}{{ row.auto_joined ? t.common.yes : t.common.no }}????(??????)
function isMasterAccount(account: any): boolean {
  // ?? is_team_owner ????,??????/????? API ??
  return account.is_team_owner === true;
}

// ????????(???/??????)
function getGroupStats(group: string): { masters: number; members: number } {
  const groupAccounts = accountsStore.accounts.filter(a => a.group === group);
  // ???:????????
  const masters = groupAccounts.filter(a => isMasterAccount(a)).length;
  // ????:????
  const members = groupAccounts.length - masters;
  return { masters, members };
}

// ??????(????????)
function getGroupLabel(group: string): string {
  const stats = getGroupStats(group);
  return `${group} (?${stats.masters}/??${stats.members})`;
}

// ?????(???)
function formatTime(timeStr: string): string {
  const date = new Date(timeStr);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ?????(????)
function formatFullTime(timeStr: string): string {
  const date = new Date(timeStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

// ?????
function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN');
}

// ???????????
function handleTargetTypeChange() {
  newConfig.value.targetId = '';
}

// ????
async function handleAddConfig() {
  if (!newConfig.value.targetId) {
    ElMessage.warning('?????');
    return;
  }
  
  adding.value = true;
  try {
    await invoke('add_auto_reset_config', {
      targetType: newConfig.value.targetType,
      targetId: newConfig.value.targetId,
      checkInterval: newConfig.value.checkInterval,
      usageThreshold: newConfig.value.usageThreshold,
      remainingThreshold: newConfig.value.remainingThreshold,
    });
    
    ElMessage.success('????');
    newConfig.value.targetId = '';
    await loadConfigs();
  } catch (error) {
    ElMessage.error(`????: ${error}`);
  } finally {
    adding.value = false;
  }
}

// ??????
async function handleToggleEnabled(config: AutoResetConfig, enabled: boolean) {
  config._updating = true;
  try {
    await invoke('update_auto_reset_config', { id: config.id, enabled });
    
    if (enabled) {
      const timer = setInterval(() => executeCheck(config.id), config.checkInterval * 60 * 1000);
      timerMap.value.set(config.id, timer);
    } else {
      const timer = timerMap.value.get(config.id);
      if (timer) {
        clearInterval(timer);
        timerMap.value.delete(config.id);
      }
    }
    
    ElMessage.success(enabled ? '???' : '???');
  } catch (error) {
    config.enabled = !enabled;
    ElMessage.error(`????: ${error}`);
  } finally {
    config._updating = false;
  }
}

// ????
async function handleCheckNow(config: AutoResetConfig) {
  config._checking = true;
  try {
    const result = await invoke<any>('check_and_auto_reset', { configId: config.id });
    
    if (result.reset_count > 0) {
      ElMessage.success(`??? ${result.reset_count} ????{{ t.accounts.autoReset.credits }}`);
      await accountsStore.loadAccounts();
    } else {
      ElMessage.info('????,????');
    }
    
    await loadConfigs();
  } catch (error) {
    ElMessage.error(`????: ${error}`);
  } finally {
    config._checking = false;
  }
}

// ????
async function handleCheckAll() {
  checkingAll.value = true;
  let totalReset = 0;
  
  try {
    for (const config of filteredConfigs.value.filter(c => c.enabled)) {
      const result = await invoke<any>('check_and_auto_reset', { configId: config.id });
      totalReset += result.reset_count || 0;
    }
    
    if (totalReset > 0) {
      ElMessage.success(`????,??? ${totalReset} ???`);
      await accountsStore.loadAccounts();
    } else {
      ElMessage.info('????,????');
    }
    
    await loadConfigs();
  } catch (error) {
    ElMessage.error(`????: ${error}`);
  } finally {
    checkingAll.value = false;
  }
}

// ??????
async function handleResetNow(config: AutoResetConfig) {
  config._resetting = true;
  try {
    const result = await invoke<any>('force_reset_config', { configId: config.id });
    
    if (result.reset_count > 0) {
      ElMessage.success(`??? ${result.reset_count} ????{{ t.accounts.autoReset.credits }}`);
      await accountsStore.loadAccounts();
    } else {
      ElMessage.info('????????');
    }
    
    await loadConfigs();
  } catch (error) {
    ElMessage.error(`????: ${error}`);
  } finally {
    config._resetting = false;
  }
}

// ??????
async function handleResetAll() {
  resettingAll.value = true;
  let totalReset = 0;
  
  try {
    for (const config of filteredConfigs.value.filter(c => c.enabled)) {
      const result = await invoke<any>('force_reset_config', { configId: config.id });
      totalReset += result.reset_count || 0;
    }
    
    if (totalReset > 0) {
      ElMessage.success(`????,??? ${totalReset} ???`);
      await accountsStore.loadAccounts();
    } else {
      ElMessage.info('????????');
    }
    
    await loadConfigs();
  } catch (error) {
    ElMessage.error(`????: ${error}`);
  } finally {
    resettingAll.value = false;
  }
}

// ????
function handleEditConfig(config: AutoResetConfig) {
  editingConfig.value = config;
  editForm.value = {
    checkInterval: config.checkInterval,
    usageThreshold: config.usageThreshold,
    remainingThreshold: config.remainingThreshold,
  };
  showEditDialog.value = true;
}

// {{ t.common.save }}??
async function handleSaveEdit() {
  if (!editingConfig.value) return;
  
  try {
    await invoke('update_auto_reset_config', {
      id: editingConfig.value.id,
      checkInterval: editForm.value.checkInterval,
      usageThreshold: editForm.value.usageThreshold,
      remainingThreshold: editForm.value.remainingThreshold,
    });
    
    ElMessage.success('????');
    showEditDialog.value = false;
    editingConfig.value = null;
    await loadConfigs();
  } catch (error) {
    ElMessage.error(`????: ${error}`);
  }
}

// ????
async function handleDeleteConfig(config: AutoResetConfig) {
  try {
    await ElMessageBox.confirm(
      `????? "${getTargetName(config)}" ?????????`,
      '????',
      { type: 'warning' }
    );
    
    await invoke('delete_auto_reset_config', { id: config.id });
    
    const timer = timerMap.value.get(config.id);
    if (timer) {
      clearInterval(timer);
      timerMap.value.delete(config.id);
    }
    
    ElMessage.success('????');
    await loadConfigs();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`????: ${error}`);
    }
  }
}

// ??????
async function handleClearRecords() {
  try {
    await ElMessageBox.confirm(
      '?????????????????????',
      '????',
      { type: 'warning' }
    );
    
    await invoke('clear_reset_records');
    ElMessage.success('????');
    await loadRecords();
    await loadStats();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`????: ${error}`);
    }
  }
}

function handleClose() {
  visible.value = false;
}

// ???????
watch(visible, (val) => {
  if (val) {
    loadConfigs();
    activeTab.value = 'rules';
  }
});

// ??????????
onUnmounted(() => {
  timerMap.value.forEach(timer => clearInterval(timer));
  timerMap.value.clear();
});

// ?????????
defineExpose({
  loadConfigs,
  setupTimers,
});
</script>

<style scoped>
/* ??????? */
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  margin: -16px -16px 0 -16px;
  border-radius: 4px 4px 0 0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.header-text {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
  letter-spacing: 0.5px;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2) !important;
  border: none !important;
  color: white !important;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  transform: rotate(90deg);
}

/* ???????? */
.custom-tabs :deep(.el-tabs__header) {
  margin-bottom: 16px;
  border-bottom: 2px solid #E5E7EB;
}

.custom-tabs :deep(.el-tabs__item) {
  font-weight: 500;
  font-size: 14px;
  padding: 0 20px;
  height: 44px;
  line-height: 44px;
}

.custom-tabs :deep(.el-tabs__item.is-active) {
  color: #10B981;
}

.custom-tabs :deep(.el-tabs__active-bar) {
  background-color: #10B981;
  height: 3px;
  border-radius: 3px;
}

/* ??????? */
.tab-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ???? */
.add-config-card,
.config-list-card {
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  overflow: hidden;
}

.add-config-card :deep(.el-card__header),
.config-list-card :deep(.el-card__header) {
  background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%);
  border-bottom: 1px solid #E5E7EB;
  padding: 14px 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #374151;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.header-pagination {
  margin: 0;
  padding: 0;
}

.header-pagination :deep(.el-pagination__sizes),
.header-pagination :deep(.el-pagination__jump) {
  margin: 0;
}

.header-pagination :deep(.el-select) {
  width: 90px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* ???? */
.unit-label {
  margin-left: 8px;
  color: #6B7280;
  font-size: 12px;
  font-weight: 500;
}

.tip-text {
  margin-left: 16px;
  color: #6B7280;
  font-size: 12px;
  background: #F0FDF4;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #BBF7D0;
}

/* ?????? */
.target-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.target-name {
  word-break: break-all;
  font-weight: 500;
}

.condition-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #6B7280;
  background: #F9FAFB;
  padding: 6px 10px;
  border-radius: 6px;
}

.no-data {
  color: #9CA3AF;
}

/* ?? */
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #F3F4F6;
}

/* ???? */
.nickname {
  color: #D97706;
  font-size: 12px;
  margin-left: 4px;
  font-weight: 500;
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid #FCD34D;
}

.usage-percent {
  color: #6B7280;
  font-size: 12px;
  margin-left: 4px;
}

/* ?????? */
.interval-presets {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}

.interval-presets .el-button {
  padding: 4px 10px;
  font-size: 12px;
  border-radius: 6px;
  background: #F3F4F6;
  color: #6B7280;
  border: 1px solid #E5E7EB;
}

.interval-presets .el-button:hover {
  background: #10B981;
  color: white;
  border-color: #10B981;
}

/* ?????? */
.group-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.group-stats {
  display: flex;
  gap: 4px;
}

.group-stats .el-tag {
  font-size: 10px;
  padding: 0 6px;
  border-radius: 4px;
}

.group-info {
  display: flex;
  gap: 4px;
  margin-left: 8px;
}

.group-info .el-tag {
  font-size: 10px;
  padding: 0 6px;
  border-radius: 4px;
}

/* ?????? */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th.el-table__cell) {
  background: #F9FAFB !important;
  font-weight: 600;
  color: #374151;
}

:deep(.el-table td.el-table__cell) {
  padding: 12px 0;
}

/* ?????? */
:root.dark .dialog-header {
  background: linear-gradient(135deg, #065F46 0%, #064E3B 100%);
}

:root.dark .custom-tabs :deep(.el-tabs__header) {
  border-bottom-color: #374151;
}

:root.dark .custom-tabs :deep(.el-tabs__item) {
  color: #9CA3AF;
}

:root.dark .custom-tabs :deep(.el-tabs__item.is-active) {
  color: #34D399;
}

:root.dark .custom-tabs :deep(.el-tabs__active-bar) {
  background-color: #34D399;
}

:root.dark .add-config-card,
:root.dark .config-list-card {
  border-color: #374151;
  background: #1F2937;
}

:root.dark .add-config-card :deep(.el-card__header),
:root.dark .config-list-card :deep(.el-card__header) {
  background: linear-gradient(135deg, #1F2937 0%, #111827 100%);
  border-bottom-color: #374151;
}

:root.dark .card-header {
  color: #F3F4F6;
}

:root.dark .tip-text {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: #34D399;
}

:root.dark .condition-info {
  background: #111827;
  color: #9CA3AF;
}

:root.dark .nickname {
  background: linear-gradient(135deg, #78350F 0%, #92400E 100%);
  border-color: #B45309;
  color: #FDE68A;
}

:root.dark .interval-presets .el-button {
  background: #374151;
  border-color: #4B5563;
  color: #9CA3AF;
}

:root.dark .interval-presets .el-button:hover {
  background: #10B981;
  border-color: #10B981;
  color: white;
}

:root.dark .pagination-wrapper {
  border-top-color: #374151;
}

:root.dark :deep(.el-table th.el-table__cell) {
  background: #111827 !important;
  color: #F3F4F6;
}

:root.dark :deep(.el-table) {
  background: #1F2937;
}

:root.dark :deep(.el-table tr) {
  background: #1F2937;
}

:root.dark :deep(.el-table td.el-table__cell) {
  border-bottom-color: #374151;
}
</style>





