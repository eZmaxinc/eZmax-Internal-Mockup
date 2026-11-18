<template>
   <ez-dialog
      v-model="isOpen"
      :title="theDialogTitle"
      width="min(920px, calc(100vw - 32px))"
   >
      <div v-if="run" class="report-dialog || flex flex-col gap-4">
         <ez-message-important
            v-if="run.state === 'running'"
            type="info"
            :title="
               $gettext('Exécution en cours — %{percent} %', {
                  percent: run.progressPercent,
               })
            "
         >
            <p class="m-0 mb-2">{{ run.currentStep }}</p>
            <div class="report-dialog__progress-track">
               <div
                  class="report-dialog__progress-fill"
                  :style="{ width: `${run.progressPercent}%` }"
               />
            </div>
            <template #actions>
               <ez-btn
                  variant="danger"
                  size="sm"
                  :icon="ez.icons.close"
                  :label="$gettext('Annuler l’exécution')"
                  @click="emit('cancel', run.id)"
               />
            </template>
         </ez-message-important>

         <ez-message-important
            v-if="theDownloadNotice"
            type="success"
            :title="theDownloadNotice"
         />

         <div class="flex flex-col gap-2">
            <h4 class="m-0 text-sm font-semibold text-foreground">
               {{ $gettext("Informations") }}
            </h4>
            <EzInfoList tiles :items="theMetaItems">
               <template #value-state>
                  <ez-badge
                     :tone="runStateTone(run.state)"
                     :label="runStateLabel(run.state)"
                     solid
                  />
               </template>
               <template #value-branch>
                  <div
                     class="report-dialog__branch"
                     :title="`${run.branch} (${run.commitSha})`"
                  >
                     <span
                        class="report-dialog__branch-name font-mono font-semibold"
                        >{{ run.branch }}</span
                     >
                     <span class="text-foreground-subtle shrink-0"
                        >({{ run.commitSha }})</span
                     >
                  </div>
               </template>
               <template #value-module>
                  <span
                     class="report-dialog__truncate"
                     :title="run.moduleLabel"
                     >{{ run.moduleLabel }}</span
                  >
               </template>
            </EzInfoList>
         </div>

         <div class="flex flex-col gap-2">
            <h4 class="m-0 text-sm font-semibold text-foreground">
               {{ $gettext("Résultats") }}
            </h4>
            <EzInfoList tiles :items="theKpiItems">
               <template #value-passRate>
                  <div class="flex flex-col gap-1.5">
                     <span>{{ thePassRateLabel }}</span>
                     <div class="report-dialog__dist-bar" aria-hidden="true">
                        <span
                           class="report-dialog__dist-pass"
                           :style="{ width: `${thePassWidth}%` }"
                        />
                        <span
                           class="report-dialog__dist-fail"
                           :style="{ width: `${theFailWidth}%` }"
                        />
                        <span
                           class="report-dialog__dist-skip"
                           :style="{ width: `${theSkipWidth}%` }"
                        />
                     </div>
                  </div>
               </template>
               <template #value-passed>
                  <span class="text-foreground-positive"
                     >{{ run.passedTests }} / {{ run.totalTests }}</span
                  >
               </template>
               <template #value-failed>
                  <span
                     :class="
                        run.failedTests > 0 ? 'text-foreground-negative' : ''
                     "
                  >
                     {{ run.failedTests }}
                  </span>
               </template>
            </EzInfoList>
         </div>
      </div>

      <template #actions>
         <div
            v-if="run"
            class="flex flex-wrap items-center justify-between gap-2 w-full"
         >
            <div class="flex flex-wrap gap-2">
               <ez-btn
                  variant="secondary"
                  pill
                  :icon="ez.icons.refresh"
                  :label="$gettext('Relancer')"
                  :disabled="run.state === 'running' || !serverOnline"
                  @click="onRerun"
               />
            </div>
            <div class="flex flex-wrap gap-2">
               <ez-btn
                  variant="secondary"
                  pill
                  :icon="ez.icons.download"
                  :label="$gettext('Télécharger le log complet')"
                  :disabled="run.state === 'running'"
                  @click="onDownloadLog"
               />
               <ez-btn
                  variant="primary"
                  pill
                  :icon="ez.icons.file"
                  :label="$gettext('Télécharger le rapport complet')"
                  :disabled="run.state === 'running'"
                  @click="onDownloadReport"
               />
            </div>
         </div>
      </template>
   </ez-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { formatDateTime, gettext } from "@ez";
import EzInfoList from "./EzInfoList.vue";
import type { EzInfoItem } from "./EzInfoList.vue";
import {
   formatDuration,
   runStateLabel,
   runStateTone,
   suiteTypeLabel,
   type TestRun,
} from "../mocks";

const props = defineProps<{
   run: TestRun | null;
   serverOnline: boolean;
}>();

const emit = defineEmits<{
   cancel: [runId: number];
   rerun: [run: TestRun];
}>();

const isOpen = defineModel<boolean>({ default: false });
const theDownloadNotice = ref("");

const theDialogTitle = computed(() =>
   props.run
      ? gettext("Rapport %{code} — %{module}", {
           code: props.run.code,
           module: props.run.moduleLabel,
        })
      : gettext("Rapport de test"),
);

const theMetaItems = computed<EzInfoItem[]>(() => {
   if (!props.run) return [];
   return [
      {
         key: "requestedBy",
         label: gettext("Demandé par"),
         value: props.run.requestedBy,
      },
      {
         key: "startedAt",
         label: gettext("Date et heure"),
         value: formatDateTime(props.run.startedAt),
      },
      {
         key: "duration",
         label: gettext("Durée"),
         value:
            props.run.state === "running"
               ? gettext("En cours…")
               : formatDuration(props.run.durationSeconds),
      },
      {
         key: "branch",
         label: gettext("Branche"),
         value: props.run.branch,
         span: 2,
      },
      {
         key: "state",
         label: gettext("Statut"),
         value: runStateLabel(props.run.state),
      },
      {
         key: "module",
         label: gettext("Module"),
         value: props.run.moduleLabel,
         span: 2,
      },
      {
         key: "suiteType",
         label: gettext("Portée"),
         value: suiteTypeLabel(props.run.suiteType),
      },
   ];
});

const thePassRateLabel = computed(() => {
   if (!props.run || props.run.totalTests === 0) return "—";
   const rate = (props.run.passedTests / props.run.totalTests) * 100;
   return `${rate.toFixed(1)} %`;
});

const theKpiItems = computed(() => {
   if (!props.run) return [];
   return [
      {
         key: "passRate",
         label: gettext("Taux de réussite"),
         value: thePassRateLabel.value,
      },
      {
         key: "passed",
         label: gettext("Tests réussis"),
         value: `${props.run.passedTests} / ${props.run.totalTests}`,
      },
      {
         key: "failed",
         label: gettext("Tests échoués"),
         value: props.run.failedTests,
      },
      {
         key: "coverage",
         label: gettext("Couverture de code"),
         value:
            props.run.coveragePercent !== null
               ? `${props.run.coveragePercent.toFixed(1)} %`
               : "—",
      },
   ];
});

const thePassWidth = computed(() => {
   if (!props.run || props.run.totalTests === 0) return 0;
   return (props.run.passedTests / props.run.totalTests) * 100;
});

const theFailWidth = computed(() => {
   if (!props.run || props.run.totalTests === 0) return 0;
   return (props.run.failedTests / props.run.totalTests) * 100;
});

const theSkipWidth = computed(() => {
   if (!props.run || props.run.totalTests === 0) return 0;
   return (props.run.skippedTests / props.run.totalTests) * 100;
});

function triggerFileDownload(
   filename: string,
   content: string,
   mimeType: string,
) {
   const blob = new Blob([content], { type: mimeType });
   const url = URL.createObjectURL(blob);
   const link = document.createElement("a");
   link.href = url;
   link.download = filename;
   document.body.appendChild(link);
   link.click();
   link.remove();
   URL.revokeObjectURL(url);
   theDownloadNotice.value = gettext("Téléchargement démarré: %{file}", {
      file: filename,
   });
}

function onDownloadLog() {
   if (!props.run) return;
   const slug = props.run.code.replace("#", "");
   triggerFileDownload(
      `${slug}-console.log`,
      `${props.run.logLines.join("\n")}\n`,
      "text/plain;charset=utf-8",
   );
}

function onDownloadReport() {
   if (!props.run) return;
   const slug = props.run.code.replace("#", "");
   const html = [
      '<!doctype html><html lang="fr"><head><meta charset="utf-8">',
      `<title>Rapport ${props.run.code}</title></head><body>`,
      `<h1>Rapport ${props.run.code} — ${props.run.moduleLabel}</h1>`,
      `<p><strong>Demandé par:</strong> ${props.run.requestedBy}<br>`,
      `<strong>Date et heure:</strong> ${formatDateTime(props.run.startedAt)}<br>`,
      `<strong>Branche:</strong> ${props.run.branch} (${props.run.commitSha})<br>`,
      `<strong>Statut:</strong> ${runStateLabel(props.run.state)}<br>`,
      `<strong>Résultats:</strong> ${props.run.passedTests} réussis, ${props.run.failedTests} échoués, ${props.run.skippedTests} ignorés</p>`,
      `<pre>${props.run.logLines.join("\n")}</pre>`,
      "</body></html>",
   ].join("\n");
   triggerFileDownload(`${slug}-rapport.html`, html, "text/html;charset=utf-8");
}

function onRerun() {
   if (!props.run) return;
   emit("rerun", props.run);
   isOpen.value = false;
}

watch(
   () => props.run?.id,
   () => {
      theDownloadNotice.value = "";
   },
);

watch(isOpen, (open) => {
   if (!open) {
      theDownloadNotice.value = "";
   }
});
</script>

<style scoped>
.report-dialog__progress-track {
   height: 8px;
   border-radius: var(--radius-full);
   background: var(--color-surface);
   overflow: hidden;
}

.report-dialog__progress-fill {
   height: 100%;
   border-radius: var(--radius-full);
   background: var(--color-info);
   transition: width 250ms ease;
}

.report-dialog__dist-bar {
   display: flex;
   height: 6px;
   border-radius: var(--radius-full);
   background: var(--color-border);
   overflow: hidden;
}

.report-dialog__dist-pass {
   background: var(--color-positive);
}

.report-dialog__dist-fail {
   background: var(--color-negative);
}

.report-dialog__dist-skip {
   background: var(--color-warning);
}

.report-dialog__branch {
   display: flex;
   align-items: baseline;
   gap: 4px;
   min-width: 0;
   max-width: 100%;
}

.report-dialog__branch-name {
   min-width: 0;
   flex: 0 1 auto;
   overflow: hidden;
   text-overflow: ellipsis;
   white-space: nowrap;
}

.report-dialog__truncate {
   display: block;
   max-width: 100%;
   overflow: hidden;
   text-overflow: ellipsis;
   white-space: nowrap;
}
</style>
