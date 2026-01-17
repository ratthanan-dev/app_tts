use std::process::Command;
use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use tauri::Manager;
use base64::{Engine as _, engine::general_purpose};

#[derive(Serialize, Deserialize, Clone)]
pub struct TtsResult {
    success: bool,
    output: Option<String>,
    filename: Option<String>,
    error: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AudioFile {
    name: String,
    path: String,
    created: u64,
}

/// Generate TTS audio from text using Python edge-tts
#[tauri::command]
fn generate_tts(
    app: tauri::AppHandle,
    text: String,
    gender: String,
    rate: String,
    pitch: String,
) -> TtsResult {
    let audio_dir = get_audio_dir(&app);
    
    // Ensure audio directory exists
    if let Err(e) = fs::create_dir_all(&audio_dir) {
        return TtsResult {
            success: false,
            output: None,
            filename: None,
            error: Some(format!("Failed to create audio directory: {}", e)),
        };
    }
    
    // Get Python script path
    let python_script = get_python_script_path(&app);
    
    // Run Python TTS engine
    println!("DEBUG: Executing Python: {:?} with text: {}", python_script, text);
    let output = Command::new("python3")
        .arg(&python_script)
        .arg("--text")
        .arg(&text)
        .arg("--gender")
        .arg(&gender)
        .arg("--rate")
        .arg(&rate)
        .arg("--pitch")
        .arg(&pitch)
        .arg("--output-dir")
        .arg(&audio_dir)
        .output();
    
    match output {
        Ok(result) => {
            println!("DEBUG: Python exit status: {}", result.status);
            println!("DEBUG: Python stdout: {}", String::from_utf8_lossy(&result.stdout));
            println!("DEBUG: Python stderr: {}", String::from_utf8_lossy(&result.stderr));

            if result.status.success() {
                let stdout = String::from_utf8_lossy(&result.stdout);
                // Parse the last JSON line (result)
                if let Some(last_line) = stdout.lines().last() {
                    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(last_line) {
                        if parsed["success"].as_bool().unwrap_or(false) {
                            let output_path = parsed["output"].as_str().unwrap_or("");
                            let filename = output_path.split('/').last().unwrap_or("audio.mp3");
                            return TtsResult {
                                success: true,
                                output: Some(output_path.to_string()),
                                filename: Some(filename.to_string()),
                                error: None,
                            };
                        }
                    }
                }
                TtsResult {
                    success: false,
                    output: None,
                    filename: None,
                    error: Some(format!("Failed to parse TTS output. Stdout: {}", stdout)),
                }
            } else {
                let stderr = String::from_utf8_lossy(&result.stderr);
                TtsResult {
                    success: false,
                    output: None,
                    filename: None,
                    error: Some(format!("TTS process failed. Exit code: {:?}. Stderr: {}", result.status.code(), stderr)),
                }
            }
        }
        Err(e) => {
            println!("DEBUG: Failed to execute python command: {}", e);
            TtsResult {
                success: false,
                output: None,
                filename: None,
                error: Some(format!("Failed to run Python command: {}", e)),
            }
        },
    }
}

/// Get list of audio files
#[tauri::command]
fn get_audio_files(app: tauri::AppHandle) -> Vec<AudioFile> {
    let audio_dir = get_audio_dir(&app);
    let mut files = Vec::new();
    
    if let Ok(entries) = fs::read_dir(&audio_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().map_or(false, |ext| ext == "mp3") {
                let name = path.file_name()
                    .and_then(|n| n.to_str())
                    .unwrap_or("unknown")
                    .to_string();
                
                let created = entry.metadata()
                    .and_then(|m| m.created())
                    .ok()
                    .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                    .map(|d| d.as_secs())
                    .unwrap_or(0);
                
                files.push(AudioFile {
                    name,
                    path: path.to_string_lossy().to_string(),
                    created,
                });
            }
        }
    }
    
    // Sort by created time (newest first)
    files.sort_by(|a, b| b.created.cmp(&a.created));
    files
}

/// Delete an audio file
#[tauri::command]
fn delete_file(path: String) -> Result<(), String> {
    fs::remove_file(&path).map_err(|e| format!("Failed to delete: {}", e))
}

/// Rename an audio file
#[tauri::command]
fn rename_file(old_path: String, new_name: String) -> Result<String, String> {
    let old = PathBuf::from(&old_path);
    let parent = old.parent().ok_or("Invalid path")?;
    let new_path = parent.join(&new_name);
    
    fs::rename(&old_path, &new_path).map_err(|e| format!("Failed to rename: {}", e))?;
    
    Ok(new_path.to_string_lossy().to_string())
}

/// Parse PDF file
#[tauri::command]
fn parse_pdf(path: String) -> Result<String, String> {
    // Try using pdftotext command
    let output = Command::new("pdftotext")
        .arg("-layout")
        .arg(&path)
        .arg("-")
        .output();
    
    match output {
        Ok(result) if result.status.success() => {
            Ok(String::from_utf8_lossy(&result.stdout).to_string())
        }
        _ => Err("PDF parsing not available. Please install pdftotext.".to_string()),
    }
}

/// Read audio file and return as Base64 Data URI
#[tauri::command]
fn read_audio_file(path: String) -> Result<String, String> {
    let data = fs::read(&path).map_err(|e| format!("Failed to read file: {}", e))?;
    let b64 = general_purpose::STANDARD.encode(data);
    Ok(format!("data:audio/mp3;base64,{}", b64))
}

// Helper functions
fn get_audio_dir(app: &tauri::AppHandle) -> PathBuf {
    app.path()
        .app_data_dir()
        .unwrap_or_else(|_| PathBuf::from("."))
        .join("audio_files")
}

fn get_python_script_path(app: &tauri::AppHandle) -> PathBuf {
    // In dev mode, use relative path
    // In production, use bundled resource
    let resource_path = app.path()
        .resource_dir()
        .ok()
        .map(|p| p.join("python").join("tts_engine.py"));
    
    if let Some(path) = resource_path {
        if path.exists() {
            return path;
        }
    }
    
    // Fallback to relative path (dev mode)
    // When running 'tauri dev', CWD is often src-tauri
    PathBuf::from("../python").join("tts_engine.py")
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            generate_tts,
            get_audio_files,
            delete_file,
            rename_file,
            parse_pdf,
            read_audio_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
