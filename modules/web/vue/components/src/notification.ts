import '@fortawesome/fontawesome-free/css/all.css'
import _ from 'lodash'
import { defineComponent } from 'vue'
import {mapState} from 'vuex'

export const NotificationItem = defineComponent({
  props: {
    notification: Object
  },
  template: `
<div class="toast" role="alert" aria-live="assertive" aria-atomic="true" ref="toast">
  <div class="toast-header">
    <i :class="iconClass"></i>
    <strong class="mr-auto">{{notification.title}}</strong>
    <small class="text-muted">just now</small>
    <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
  <div class="toast-body">
    {{notification.content}}
  </div>
</div>
  `,
  mounted() {
    $(this.$refs.toast)
      .toast({delay:5000})
      .toast('show')
      .on('hidden.bs.toast',() => this.$store.dispatch('notifications/remove',this.notification))
  },
  computed: {
    iconClass() {
      return {
        fas: true,
        [`fa-${this.notification.icon || 'exclamation'}`]: true,
        'mr-2': true,
        rounded: true
      }
    }
  }
})

export const NotificationsList = defineComponent({
  template: `
<div class="fixed-top d-flex flex-column align-items-center">
  <notification-item :key="key" v-for="(notification, key) in notifications" :notification="notification"></notification-item>
</div>
  `,
  components: {NotificationItem},
  computed: {
    ...mapState('notifications',['notifications'])
  }
})
