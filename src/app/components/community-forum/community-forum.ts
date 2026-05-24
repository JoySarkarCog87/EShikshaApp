import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { HttpClient } from '@angular/common/http'; 
import { UserService } from '../../services/user-service';
import { ForumService } from '../../services/forum-service';

@Component({
  selector: 'app-community-forum',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './community-forum.html',
  styleUrls: ['./community-forum.css']
})
export class CommunityForumComponent implements OnInit {

  private userService = inject(UserService);
  private forumService=inject(ForumService);
  private http = inject(HttpClient);

  posts = signal<any[]>([]);
  isFormOpen = false;
  newPostTitle = '';
  newPostContent = '';
  userRole = "";

  ngOnInit() {
    this.loadForumPosts();
    this.userService.activeUser$.subscribe(res=>{
      this.userRole = res?.role??'';
    })
  }

  loadForumPosts() {
    this.forumService.loadForumPosts().subscribe({
      next: (response) => {
        console.log("Forum response dump:", response);
        
        if (response && response.result) {
          this.posts.set(response.result);
        } else if (Array.isArray(response)) {
          this.posts.set(response);
        }
      },
      error: (err) => {
        console.error('Server connection lost!', err);
      }
    });
  }

  toggleForm() {
    this.isFormOpen = !this.isFormOpen;
  }

  submitPost() {
    if (!this.newPostTitle.trim() || !this.newPostContent.trim()) {
      return;
    }

    const newEntry = {
      title: this.newPostTitle,
      description: this.newPostContent,
      users: this.userRole
    };

    console.log("Submitting custom payload to backend:", newEntry);

    this.forumService.creatForumPosts(newEntry).subscribe({
      next: (response) => {
        console.log("Posted successfully!", response);
        this.newPostTitle = '';
        this.newPostContent = '';
        this.isFormOpen = false;
        this.loadForumPosts();
      },
      error: (err) => {
        console.error("Still throwing bad request. Response from backend console was:", err);
      }
    });
  }

  postReply(postId: string, replyText: string) {
    if (!replyText.trim()) return;

    
    const replyData = {
      reply: replyText,
      user: this.userRole
    };

    console.log("Replying to post ID:", postId, "with body:", replyData);

    this.forumService.createForumReply(postId,replyData).subscribe({
      next: (response) => {
        console.log("Reply added successfully!", response);
        this.loadForumPosts(); 
      },
      error: (err) => {
        console.error("Reply transmission failed. Error object details:", err);
      }
    });
  }
}