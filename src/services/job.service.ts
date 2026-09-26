import { api } from './auth.service';

/**
 * JobService — Handles API calls for the Jobs feature
 *
 * Backend routes are mounted under /api/v1/job-service:
 *   app.ts                      → app.use('/api/v1/job-service', jobServiceRoutes)
 *   Job-Service/routers/index.ts → router.use('/jobs', jobRouter)
 *   job.routes.ts               → router.get('/list', listJobsController)
 *                                 router.get('/featured', featuredJobsController)
 *                                 router.get('/:jobId', getJobByIdController)
 *                                 router.post('/saveJob', saveJobsController)
 *   jobApplication.routes.ts    → router.post('/:jobId/apply', applyToJobController)
 *   search.routes.ts            → router.get('/advanced', advancedJobSearchController)
 *                                 router.get('/auto-complete', getAutoCompleteSuggestionsController)
 */
class JobService {
    /**
     * Fetch all jobs
     * Route: GET /api/v1/job-service/jobs/list
     */
    static async getJobs(params?: any) {
        try {
            console.log('Fetching job list...');
            const response = await api.get('/api/v1/job-service/jobs/list', { params });
            console.log('✅ Jobs fetched successfully');
            return response;
        } catch (error) {
            console.error('❌ Failed to fetch jobs', error);
            throw error;
        }
    }

    /**
     * Fetch featured jobs
     * Route: GET /api/v1/job-service/jobs/featured
     */
    static async getFeaturedJobs(params?: any) {
        try {
            const response = await api.get('/api/v1/job-service/jobs/featured', { params });
            return response;
        } catch (error) {
            console.error('❌ Failed to fetch featured jobs', error);
            throw error;
        }
    }

    /**
     * Fetch a specific job by ID
     * Route: GET /api/v1/job-service/jobs/:jobId
     */
    static async getJobById(jobId: string) {
        try {
            const response = await api.get(`/api/v1/job-service/jobs/${jobId}`);
            return response;
        } catch (error) {
            console.error(`❌ Failed to fetch job ${jobId}`, error);
            throw error;
        }
    }

    /**
     * Save or bookmark a job
     * Route: POST /api/v1/job-service/jobs/saveJob
     */
    static async saveJob(jobId: string) {
        try {
            const response = await api.post('/api/v1/job-service/jobs/saveJob', { jobId });
            return response;
        } catch (error) {
            console.error(`❌ Failed to save job ${jobId}`, error);
            throw error;
        }
    }

    /**
     * Apply to a job
     * Route: POST /api/v1/job-service/jobs/applications/:jobId/apply
     */
    static async applyToJob(jobId: string, applicationData?: any) {
        try {
            const response = await api.post(`/api/v1/job-service/jobs/applications/${jobId}/apply`, applicationData);
            return response;
        } catch (error) {
            console.error(`❌ Failed to apply to job ${jobId}`, error);
            throw error;
        }
    }

    /**
     * Search jobs (Advanced)
     * Route: GET /api/v1/job-service/jobs/search/advanced
     */
    static async searchJobs(query: string, location?: string, params?: any) {
        try {
            const response = await api.get('/api/v1/job-service/jobs/search/advanced', { 
                params: { 
                    q: query,
                    location,
                    ...params 
                } 
            });
            return response;
        } catch (error) {
            console.error('❌ Failed to search jobs', error);
            throw error;
        }
    }

    /**
     * Get Autocomplete suggestions for search
     * Route: GET /api/v1/job-service/jobs/search/auto-complete
     */
    static async getSearchSuggestions(query: string) {
        try {
            const response = await api.get('/api/v1/job-service/jobs/search/auto-complete', {
                params: { q: query }
            });
            return response;
        } catch (error) {
            console.error('❌ Failed to get search suggestions', error);
            throw error;
        }
    }
}

export default JobService;
