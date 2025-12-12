if (!requireAdmin()) {

}



document.addEventListener('DOMContentLoaded', async function() {

    console.log('Admin dashboard loaded');
    await loadAdminStats();
});



async function loadAdminStats() {
    try {
        console.log('Loading admin stats...');
        const serverResponse = await getAdminStats();

        if (serverResponse && serverResponse.stats) {
            const statsData = serverResponse.stats;
            console.log('Admin stats received:', statsData);


            const statCardElements = document.querySelectorAll('.stat_card');

            if (statCardElements[0] && statsData.totalUsers !== undefined) {
                const totalUsersNumberElement = statCardElements[0].querySelector('.stat_number');
                if (totalUsersNumberElement) {
                    totalUsersNumberElement.textContent = statsData.totalUsers;
                }
            }


            if (statCardElements[1] && statsData.totalNotes !== undefined) {
                const totalNotesNumberElement = statCardElements[1].querySelector('.stat_number');
                if (totalNotesNumberElement) {
                    totalNotesNumberElement.textContent = statsData.totalNotes;
                }
            }


            if (statCardElements[2] && statsData.totalQuizzes !== undefined) {
                const totalQuizzesNumberElement = statCardElements[2].querySelector('.stat_number');
                if (totalQuizzesNumberElement) {
                    totalQuizzesNumberElement.textContent = statsData.totalQuizzes;
                }
            }


            if (statCardElements[3] && statsData.activeToday !== undefined) {
                const activeTodayNumberElement = statCardElements[3].querySelector('.stat_number');
                if (activeTodayNumberElement) {
                    activeTodayNumberElement.textContent = statsData.activeToday;
                }
            }


            await loadRecentActivity();

        } else {
            console.log('No stats data received');
        }

    } catch (loadingError) {
        console.error('Error loading admin stats:', loadingError);
        console.log('Admin stats API might be having issues. Check server logs.');

        const activityFeedElement = document.querySelector('.activity_feed');
        if (activityFeedElement) {
            activityFeedElement.innerHTML = '<p style="color: #86868B; text-align: center; padding: 20px;">Unable to load dashboard data</p>';
        }
    }
}


async function loadRecentActivity() {
    try {
        const serverResponse = await getRecentActivity();
        const activitiesArray = serverResponse.activities || [];

        const activityFeedElement = document.querySelector('.activity_feed');
        if (!activityFeedElement) return;

        activityFeedElement.innerHTML = '';

        if (activitiesArray.length === 0) {
            activityFeedElement.innerHTML = '<p style="color: #86868B; text-align: center; padding: 20px;">No recent activity</p>';
            return;
        }

        activitiesArray.forEach(activityItem => {
            const activityItemElement = document.createElement('div');
            activityItemElement.className = 'activity_item';
            activityItemElement.innerHTML = `
                <div class="activity_icon"></div>
                <div class="activity_details">
                    <div class="activity_text">${activityItem.text}</div>
                    <div class="activity_time">${activityItem.time}</div>
                </div>
            `;
            activityFeedElement.appendChild(activityItemElement);
        });

    } catch (loadingError) {
        console.error('Error loading recent activity:', loadingError);
        const activityFeedElement = document.querySelector('.activity_feed');
        if (activityFeedElement) {
            activityFeedElement.innerHTML = '<p style="color: #86868B; text-align: center; padding: 20px;">Recent activity unavailable</p>';
        }
    }
}
