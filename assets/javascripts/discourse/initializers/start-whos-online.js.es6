import { withPluginApi } from 'discourse/lib/plugin-api';

var inject = Ember.inject;

export default {
  name: 'start-whos-online',

  initialize(container) {
    const onlineService = container.lookup('service:online-service');
    const siteSettings = container.lookup('site-settings:main');

    // If user not allowed, don't display
    if(!onlineService.get('shouldDisplay')) return;

    // If feature disabled, don't display
    if(!siteSettings.whos_online_show_avatar_icon) return;

    withPluginApi('0.2', api => {

      api.modifyClass('component:user-card-contents',{
        onlineService: inject.service('online-service'),
        classNameBindings: ['isOnline:user-online'],

        isOnline: function(){
          if(!this.get('user')){
            return false;
          }
          return this.get('onlineService').isUserOnline(this.get('user').id);
        }.property('onlineService.users.@each', 'user'),
      });

      api.modifyClass('component:topic-list-item',{
        onlineService: inject.service('online-service'),
        classNameBindings: ['isOnline:last-poster-online'],

        isOnline: function(){
          return this.get('onlineService').isUserOnline(this.get('topic.lastPoster.id'));
        }.property('onlineService.users.@each', 'user'),
      });

      api.modifyClass('component:latest-topic-list-item',{
        onlineService: inject.service('online-service'),
        classNameBindings: ['isOnline:last-poster-online'],

        isOnline: function(){
          return this.get('onlineService').isUserOnline(this.get('topic.lastPoster.id'));
        }.property('onlineService.users.@each', 'user'),
      });

      api.reopenWidget('post-avatar',
        {
          defaultState() {
            this.appEvents.on("whosonline:changed", () => {
              this.scheduleRerender();
            });
            return {};
          },

          buildClasses(){
            if(onlineService.isUserOnline(this.attrs.user_id)){
              return 'user-online';
            }
            return [];
          }
        }
      );

      api.reopenWidget('topic-participant',
        {
          defaultState() {
            this.appEvents.on("whosonline:changed", () => {
              this.scheduleRerender();
            });
            return {};
          },

          buildClasses(){
            if(onlineService.isUserOnline(this.attrs.id)){
              return 'user-online';
            }
            return [];
          }
        }
      );

    });



  },
};