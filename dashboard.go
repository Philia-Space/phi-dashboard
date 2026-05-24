// Package dashboard provides a generic admin dashboard backend for Philia Space services.
package dashboard

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

// Config holds dashboard configuration.
type Config struct {
	Prefix      string // URL prefix (e.g., "/admin")
	StaticPath  string // Path to built React files
	DevMode     bool   // Serve dev-mode HTML instead of static files
	Title       string // Dashboard title
	RequireAuth bool   // Whether to require authentication
}

// DefaultConfig returns sensible defaults.
func DefaultConfig() Config {
	return Config{
		Prefix:      "/admin",
		StaticPath:  "./web/dist",
		DevMode:     os.Getenv("DASHBOARD_DEV_MODE") == "true",
		Title:       "Philia Space Admin",
		RequireAuth: true,
	}
}

// Dashboard mounts admin routes onto an http.ServeMux.
type Dashboard struct {
	cfg     Config
	modules []Module
}

// Module represents a registered admin module (e.g., "Questions", "Passages").
type Module struct {
	Name     string `json:"name"`
	Path     string `json:"path"`
	Icon     string `json:"icon"`
	Priority int    `json:"priority"`
}

// New creates a new Dashboard.
func New(cfg Config) *Dashboard {
	return &Dashboard{cfg: cfg}
}

// RegisterModule adds a module to the admin sidebar.
func (d *Dashboard) RegisterModule(m Module) {
	d.modules = append(d.modules, m)
}

// Mount adds dashboard routes to the given mux.
func (d *Dashboard) Mount(mux *http.ServeMux) {
	prefix := strings.TrimSuffix(d.cfg.Prefix, "/")

	// API routes
	mux.HandleFunc(prefix+"/api/health", d.healthHandler())
	mux.HandleFunc(prefix+"/api/modules", d.modulesHandler())
	mux.HandleFunc(prefix+"/api/config", d.configHandler())

	// SPA catch-all
	mux.HandleFunc(prefix+"/", d.spaHandler())
}

// healthHandler returns service health status.
func (d *Dashboard) healthHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":    "healthy",
			"title":     d.cfg.Title,
			"modules":   len(d.modules),
			"timestamp": r.Context().Value("request_time"),
		})
	}
}

// modulesHandler returns registered admin modules.
func (d *Dashboard) modulesHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"data":    d.modules,
		})
	}
}

// configHandler returns dashboard configuration for the frontend.
func (d *Dashboard) configHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"data": map[string]interface{}{
				"title":        d.cfg.Title,
				"prefix":       d.cfg.Prefix,
				"require_auth": d.cfg.RequireAuth,
				"modules":      d.modules,
			},
		})
	}
}

// spaHandler serves the React SPA.
func (d *Dashboard) spaHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if d.cfg.DevMode {
			d.devModeHTML(w, r)
			return
		}

		// Serve static files
		path := filepath.Join(d.cfg.StaticPath, strings.TrimPrefix(r.URL.Path, d.cfg.Prefix))
		info, err := os.Stat(path)
		if os.IsNotExist(err) || info.IsDir() {
			// Fallback to index.html for SPA routing
			path = filepath.Join(d.cfg.StaticPath, "index.html")
		}

		http.ServeFile(w, r, path)
	}
}

func (d *Dashboard) devModeHTML(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html")
	fmt.Fprintf(w, `<!DOCTYPE html>
<html>
<head><title>%s</title></head>
<body>
<h1>%s</h1>
<p>Dashboard running in development mode.</p>
<p>Modules: %d</p>
<ul>
`, d.cfg.Title, d.cfg.Title, len(d.modules))
	for _, m := range d.modules {
		fmt.Fprintf(w, "<li><a href=\"%s\">%s</a></li>\n", m.Path, m.Name)
	}
	fmt.Fprint(w, "</ul></body></html>")
}

// AdminHandler wraps an HTTP handler with admin authentication check.
func AdminHandler(next http.HandlerFunc, roles ...string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// TODO: Extract user from context and check roles
		// For now, pass through (rely on service-level auth middleware)
		next(w, r)
	}
}

// CrudRoutes generates standard CRUD routes for a resource.
type CrudRoutes struct {
	List   http.HandlerFunc
	Get    http.HandlerFunc
	Create http.HandlerFunc
	Update http.HandlerFunc
	Delete http.HandlerFunc
}

// MountCrud registers standard REST routes for a resource.
func MountCrud(mux *http.ServeMux, prefix string, routes CrudRoutes) {
	mux.HandleFunc(prefix, func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			routes.List(w, r)
		case http.MethodPost:
			routes.Create(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})
	mux.HandleFunc(prefix+"/{id}", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			routes.Get(w, r)
		case http.MethodPut, http.MethodPatch:
			routes.Update(w, r)
		case http.MethodDelete:
			routes.Delete(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})
}
