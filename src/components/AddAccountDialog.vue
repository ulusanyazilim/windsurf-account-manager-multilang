<template>
  <el-dialog
    v-model="uiStore.showAddAccountDialog"
    :title="t.accounts.addAccount"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="currentRules"
      label-width="100px"
      autocomplete="off"
    >
      <!-- 添加方式切换 -->
      <el-form-item :label="t.accounts.addMode">
        <el-radio-group v-model="addMode" @change="handleModeChange">
          <el-radio value="password">{{ t.accounts.emailPassword }}</el-radio>
          <el-radio value="refresh_token">{{ t.accounts.refreshTokenMode }}</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 邮箱密码模式 -->
      <template v-if="addMode === 'password'">
        <el-form-item :label="t.accounts.email" prop="email">
          <el-input
            v-model="formData.email"
            :placeholder="t.accounts.enterEmail"
            :prefix-icon="Message"
            autocomplete="off"
          />
        </el-form-item>
        
        <el-form-item :label="t.accounts.password" prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            :placeholder="t.accounts.enterPassword"
            :prefix-icon="Lock"
            show-password
            autocomplete="new-password"
          />
        </el-form-item>
      </template>

      <!-- Refresh Token 模式 -->
      <template v-else>
        <el-form-item :label="t.accounts.refreshTokenMode" prop="refreshToken">
          <el-input
            v-model="formData.refreshToken"
            type="textarea"
            :rows="3"
            :placeholder="t.accounts.enterRefreshToken"
          />
        </el-form-item>
      </template>
      
      <el-form-item :label="t.accounts.remark" prop="nickname">
        <el-input
          v-model="formData.nickname"
          :placeholder="t.accounts.remarkPlaceholder"
          :prefix-icon="User"
        />
      </el-form-item>
      
      <el-form-item :label="t.accounts.group">
        <el-select
          v-model="formData.group"
          :placeholder="t.accounts.selectGroup"
          clearable
        >
          <el-option
            v-for="group in settingsStore.groups"
            :key="group"
            :label="group"
            :value="group"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item :label="t.accounts.tags">
        <el-select
          v-model="formData.tags"
          multiple
          filterable
          allow-create
          :placeholder="t.accounts.selectTags"
          style="width: 100%"
        >
          <el-option
            v-for="tag in settingsStore.tags"
            :key="tag.name"
            :label="tag.name"
            :value="tag.name"
          >
            <span :style="getTagOptionStyle(tag.color)">{{ tag.name }}</span>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="handleClose">{{ t.common.cancel }}</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">
        {{ t.common.confirm }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { Message, Lock, User } from '@element-plus/icons-vue';
import { useAccountsStore, useSettingsStore, useUIStore } from '@/store';
import { useI18n } from '@/composables/useI18n';
import { apiService, accountApi } from '@/api';
import { invoke } from '@tauri-apps/api/core';

const accountsStore = useAccountsStore();
const settingsStore = useSettingsStore();
const uiStore = useUIStore();
const { t } = useI18n();

const formRef = ref<FormInstance>();
const loading = ref(false);
const addMode = ref<'password' | 'refresh_token'>('password');

const formData = reactive({
  email: '',
  password: '',
  refreshToken: '',
  nickname: '',
  group: '',
  tags: [] as string[]
});

// Watch current locale to update group default
// But group default is set on clear. Let's make it smarter.
// Actually 'Default Group' is usually just a string in the store. 
// If the store keeps it localized, that's complex. Assuming group names are user defined except 'Default Group'.

// computed validation rules
const currentRules = computed<FormRules>(() => {
  const passwordRules: FormRules = {
    email: [
      { required: true, message: t.value.accounts.enterEmail, trigger: 'blur' },
      { type: 'email', message: t.value.accounts.validEmail, trigger: 'blur' }
    ],
    password: [
      { required: true, message: t.value.accounts.enterPassword, trigger: 'blur' },
      { min: 6, message: t.value.accounts.passwordLength, trigger: 'blur' }
    ],
    nickname: [
      { max: 20, message: t.value.accounts.remarkLength, trigger: 'blur' }
    ]
  };

  const refreshTokenRules: FormRules = {
    refreshToken: [
      { required: true, message: t.value.accounts.enterRefreshToken, trigger: 'blur' },
      { min: 10, message: t.value.accounts.refreshTokenFormat, trigger: 'blur' }
    ],
    nickname: [
      { max: 20, message: t.value.accounts.remarkLength, trigger: 'blur' }
    ]
  };

  return addMode.value === 'password' ? passwordRules : refreshTokenRules;
});

// 切换模式时重置表单
function handleModeChange() {
  formRef.value?.resetFields();
}

// 获取标签选项样式
function getTagOptionStyle(color: string): Record<string, string> {
  if (!color) return {};
  
  let r = 0, g = 0, b = 0;
  let parsed = false;
  
  // 解析 rgba 或 rgb 格式
  if (color.startsWith('rgba') || color.startsWith('rgb')) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      r = parseInt(match[1]);
      g = parseInt(match[2]);
      b = parseInt(match[3]);
      parsed = true;
    }
  } 
  // 解析 HEX 格式
  if (!parsed && color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length >= 6) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
      parsed = true;
    }
  }
  
  if (!parsed) return {};
  
  return {
    color: `rgb(${r}, ${g}, ${b})`,
    fontWeight: '500'
  };
}

async function handleSubmit() {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    
    loading.value = true;
    try {
      if (addMode.value === 'refresh_token') {
        // Refresh Token 模式
        const trimmedToken = formData.refreshToken.trim();
        const trimmedNickname = formData.nickname.trim() || undefined;
        
// ...
        
        if (!trimmedToken) {
          ElMessage.error(t.value.accounts.refreshTokenFormat); // Using refreshTokenFormat as empty check too for simplicity or add specific key
          loading.value = false;
          return;
        }
        
        // 调用后端接口添加账号
        const result = await invoke<any>('add_account_by_refresh_token', {
          refreshToken: trimmedToken,
          nickname: trimmedNickname,
          tags: formData.tags,
          group: formData.group || t.value.accounts.defaultGroup
        });
        
        if (result.success) {
          ElMessage.success(t.value.accounts.addSuccess);
          // 刷新账号列表
          await accountsStore.loadAccounts();
          handleClose();
        } else {
          ElMessage.error(result.error || t.value.accounts.addFailed);
        }
      } else {
        // 邮箱密码模式
        const trimmedEmail = formData.email.trim();
        const trimmedPassword = formData.password.trim();
        const trimmedNickname = formData.nickname.trim() || trimmedEmail.split('@')[0];
        
        if (!trimmedPassword) {
          ElMessage.error(t.value.accounts.passwordRequired);
          loading.value = false;
          return;
        }
        
        // 添加账号
        const newAccount = await accountsStore.addAccount({
          email: trimmedEmail,
          password: trimmedPassword,
          nickname: trimmedNickname,
          tags: formData.tags,
          group: formData.group || t.value.accounts.defaultGroup
        });
        
        ElMessage.success(t.value.common.loading); // "Loading..." as closest match for "Account added, logging in..." or better "Adding..."
        
        // 自动登录并获取账号详细信息
        try {
          const loginResult = await apiService.loginAccount(newAccount.id);
          
          if (loginResult.success) {
            const latestAccount = await accountApi.getAccount(newAccount.id);
            await accountsStore.updateAccount(latestAccount);
            ElMessage.success(t.value.accounts.infoUpdated);
          } else {
            ElMessage.warning(t.value.accounts.loginFailed);
          }
        } catch (infoError) {
          console.error('Failed to get account info:', infoError);
          ElMessage.warning(t.value.accounts.updateFailed);
        }
        
        handleClose();
      }
    } catch (error) {
      ElMessage.error(`${t.value.accounts.addFailed}: ${error}`);
    } finally {
      loading.value = false;
    }
  });
}

function handleClose() {
  uiStore.closeAddAccountDialog();
  formRef.value?.resetFields();
  
  // 重置表单数据
  formData.email = '';
  formData.password = '';
  formData.refreshToken = '';
  formData.nickname = '';
  formData.group = t.value.accounts.defaultGroup;
  formData.tags = [];
  addMode.value = 'password';
}
</script>
